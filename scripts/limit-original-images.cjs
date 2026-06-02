const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");

const DEFAULT_ROOT = path.resolve("public/assets/projects");
const DEFAULT_MAX_BYTES = 20 * 1024 * 1024;
const PROCESSABLE_EXTENSIONS = new Set([".gif", ".jpg", ".jpeg", ".png"]);
const AUDIT_ONLY_EXTENSIONS = new Set([".tif", ".tiff"]);

const formatBytes = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)}MB`;

const parseArgs = (argv) => {
  const options = {
    dryRun: false,
    maxBytes: DEFAULT_MAX_BYTES,
    root: DEFAULT_ROOT,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--root") {
      options.root = path.resolve(argv[index + 1] || "");
      index += 1;
      continue;
    }

    if (arg === "--max-mb") {
      const value = Number(argv[index + 1]);
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error("--max-mb must be a positive number.");
      }

      options.maxBytes = Math.floor(value * 1024 * 1024);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
};

const walkFiles = async (folderPath) => {
  const entries = await fs.readdir(folderPath, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(folderPath, entry.name);

      if (entry.isDirectory()) {
        return walkFiles(fullPath);
      }

      return entry.isFile() ? [fullPath] : [];
    })
  );

  return nestedFiles.flat();
};

const getFileSize = async (filePath) => {
  const stats = await fs.stat(filePath);
  return stats.size;
};

const createPipeline = (input, ext, metadata, options) => {
  const pipeline = sharp(input, {
    animated: ext === ".gif",
    limitInputPixels: false,
  }).rotate();

  if (options.scale < 1 && metadata.width && metadata.height) {
    pipeline.resize({
      width: Math.max(1, Math.round(metadata.width * options.scale)),
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  if (ext === ".png") {
    return pipeline.png({
      adaptiveFiltering: true,
      compressionLevel: 9,
      effort: 10,
      palette: options.palette,
      quality: options.palette ? options.quality : undefined,
    });
  }

  if (ext === ".gif") {
    return pipeline.gif({
      colours: options.colours,
      dither: options.dither,
      effort: 10,
      interFrameMaxError: options.interFrameMaxError,
      interPaletteMaxError: options.interPaletteMaxError,
    });
  }

  return pipeline.jpeg({
    mozjpeg: true,
    progressive: true,
    quality: options.quality,
  });
};

const writeCandidate = async (filePath, input, ext, metadata, options) => {
  const tempPath = `${filePath}.tmp-${process.pid}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}${ext}`;

  await createPipeline(input, ext, metadata, options).toFile(tempPath);

  return tempPath;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withRetries = async (operation, description) => {
  const delays = [0, 150, 300, 600, 1000];
  let lastError;

  for (const waitMs of delays) {
    if (waitMs) {
      await delay(waitMs);
    }

    try {
      return await operation();
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(`${description} failed: ${lastError?.message || lastError}`);
};

const replaceFile = async (filePath, tempPath, ext) => {
  const backupPath = `${filePath}.backup-${process.pid}${ext}`;

  await withRetries(() => fs.copyFile(filePath, backupPath), "Create backup");

  try {
    await withRetries(() => fs.access(tempPath), "Verify temp file");
    await withRetries(() => fs.rm(filePath, { force: true }), "Remove original");
    await withRetries(() => fs.rename(tempPath, filePath), "Move temp into place");
    await withRetries(() => fs.rm(backupPath, { force: true }), "Remove backup");
  } catch (error) {
    try {
      await fs.access(filePath);
    } catch {
      await withRetries(() => fs.copyFile(backupPath, filePath), "Restore backup");
    }
    throw error;
  }
};

const getJpegAttempts = () => {
  const attempts = [];
  const qualities = [92, 88, 84, 80, 76, 72, 68, 64, 60, 56, 52, 48];
  const scales = [1, 0.95, 0.9, 0.85, 0.8, 0.74, 0.68, 0.62, 0.56, 0.5];

  scales.forEach((scale) => {
    qualities.forEach((quality) => {
      attempts.push({ quality, scale });
    });
  });

  return attempts;
};

const getPngAttempts = () => {
  const attempts = [];
  const scales = [1, 0.95, 0.9, 0.85, 0.8, 0.74, 0.68, 0.62, 0.56, 0.5, 0.44];

  scales.forEach((scale) => {
    attempts.push({ palette: false, quality: 100, scale });
  });

  [0.56, 0.5, 0.44, 0.38, 0.32].forEach((scale) => {
    [96, 88, 80].forEach((quality) => {
      attempts.push({ palette: true, quality, scale });
    });
  });

  return attempts;
};

const getGifAttempts = () => {
  return [
    { colours: 192, dither: 0.8, interFrameMaxError: 8, interPaletteMaxError: 16, scale: 0.6 },
    { colours: 160, dither: 0.8, interFrameMaxError: 10, interPaletteMaxError: 20, scale: 0.52 },
    { colours: 128, dither: 0.8, interFrameMaxError: 12, interPaletteMaxError: 24, scale: 0.44 },
    { colours: 96, dither: 0.7, interFrameMaxError: 16, interPaletteMaxError: 32, scale: 0.36 },
    { colours: 64, dither: 0.6, interFrameMaxError: 20, interPaletteMaxError: 48, scale: 0.3 },
  ];
};

const getAttempts = (ext) => {
  if (ext === ".gif") return getGifAttempts();

  return ext === ".png" ? getPngAttempts() : getJpegAttempts();
};

const processImage = async (filePath, options) => {
  const ext = path.extname(filePath).toLowerCase();
  const originalSize = await getFileSize(filePath);

  if (originalSize <= options.maxBytes) {
    return { status: "ok", filePath, originalSize };
  }

  if (!PROCESSABLE_EXTENSIONS.has(ext)) {
    return {
      status: AUDIT_ONLY_EXTENSIONS.has(ext) ? "unsupported" : "skipped",
      filePath,
      originalSize,
    };
  }

  if (options.dryRun) {
    return { status: "would-process", filePath, originalSize };
  }

  const input = await fs.readFile(filePath);
  const metadata = await sharp(input, {
    animated: ext === ".gif",
    limitInputPixels: false,
  }).metadata();
  let smallestCandidate = null;

  for (const attempt of getAttempts(ext)) {
    const tempPath = await writeCandidate(filePath, input, ext, metadata, attempt);
    const candidateSize = await getFileSize(tempPath);

    if (!smallestCandidate || candidateSize < smallestCandidate.size) {
      if (smallestCandidate) {
        await fs.rm(smallestCandidate.tempPath, { force: true });
      }

      smallestCandidate = {
        attempt,
        size: candidateSize,
        tempPath,
      };
    } else {
      await fs.rm(tempPath, { force: true });
    }

    if (candidateSize <= options.maxBytes) {
      await replaceFile(filePath, smallestCandidate.tempPath, ext);

      return {
        attempt,
        filePath,
        originalSize,
        status: "processed",
        targetSize: candidateSize,
      };
    }
  }

  if (smallestCandidate) {
    await fs.rm(smallestCandidate.tempPath, { force: true });
  }

  return {
    filePath,
    originalSize,
    smallestSize: smallestCandidate?.size,
    status: "failed",
  };
};

const run = async () => {
  const options = parseArgs(process.argv.slice(2));
  const files = (await walkFiles(options.root)).sort((fileA, fileB) => {
    const aIsGif = path.extname(fileA).toLowerCase() === ".gif";
    const bIsGif = path.extname(fileB).toLowerCase() === ".gif";

    if (aIsGif === bIsGif) {
      return fileA.localeCompare(fileB, "en", { numeric: true });
    }

    return aIsGif ? 1 : -1;
  });
  const results = [];

  console.log(
    `Limiting original images in ${options.root} to ${formatBytes(options.maxBytes)}${options.dryRun ? " (dry run)" : ""}`
  );

  for (const filePath of files) {
    const result = await processImage(filePath, options);
    results.push(result);

    if (result.status === "processed") {
      console.log(
        `Processed ${filePath}: ${formatBytes(result.originalSize)} -> ${formatBytes(result.targetSize)}`
      );
    } else if (result.status === "would-process") {
      console.log(`Would process ${filePath}: ${formatBytes(result.originalSize)}`);
    } else if (result.status === "unsupported") {
      console.warn(
        `Unsupported over-limit original ${filePath}: ${formatBytes(result.originalSize)}`
      );
    } else if (result.status === "failed") {
      console.error(
        `Failed ${filePath}: ${formatBytes(result.originalSize)}; smallest candidate ${formatBytes(result.smallestSize || 0)}`
      );
    }
  }

  const summary = results.reduce(
    (counts, result) => ({
      ...counts,
      [result.status]: (counts[result.status] || 0) + 1,
    }),
    {}
  );

  console.log(`Summary: ${JSON.stringify(summary)}`);

  if (summary.failed || summary.unsupported) {
    process.exitCode = 1;
  }
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
