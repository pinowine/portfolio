type TranslateFn = (key: string, options?: { defaultValue?: string }) => string;

const padMarkdownIndex = (index: number) => String(index + 1).padStart(3, "0");

const translateValue = (
  t: TranslateFn,
  keyPrefix: string,
  keySuffix: string,
  value: string
) => {
  return t(`${keyPrefix}.${keySuffix}`, {
    defaultValue: value,
  });
};

const translateTrimmedLine = (
  code: string,
  index: number,
  source: string,
  t: TranslateFn
) => {
  const keyPrefix = `markdown.${code}.${padMarkdownIndex(index)}`;

  const imageMatch = /^!\[(.*?)\{(.*?)\}\]\((.*?)\)$/.exec(source);
  if (imageMatch) {
    const alt = translateValue(t, keyPrefix, "alt", imageMatch[1]);
    const description = translateValue(
      t,
      keyPrefix,
      "description",
      imageMatch[2]
    );
    return `![${alt}{${description}}](${imageMatch[3]})`;
  }

  const pdfMatch = /^\[pdf:(.*?)\{(.*?)\}\]\((.*?)\)$/.exec(source);
  if (pdfMatch) {
    const description = translateValue(
      t,
      keyPrefix,
      "description",
      pdfMatch[1]
    );
    return `[pdf:${description}{${pdfMatch[2]}}](${pdfMatch[3]})`;
  }

  const audioMatch = /^\[audio:(.*?)\{(.*?)\}\]\((.*?)\{(.*?)\}\)$/.exec(
    source
  );
  if (audioMatch) {
    const name = translateValue(t, keyPrefix, "name", audioMatch[1]);
    const description = translateValue(
      t,
      keyPrefix,
      "description",
      audioMatch[2]
    );
    return `[audio:${name}{${description}}](${audioMatch[3]}{${audioMatch[4]}})`;
  }

  const websiteMatch = /^\[website:(.*?)\{(.*?)\}\]\((.*?)\)$/.exec(source);
  if (websiteMatch) {
    const title = translateValue(t, keyPrefix, "title", websiteMatch[1]);
    const description = translateValue(
      t,
      keyPrefix,
      "description",
      websiteMatch[2]
    );
    return `[website:${title}{${description}}](${websiteMatch[3]})`;
  }

  const videoMatch = /^\[video:(.*?)\]\((.*?)\)$/.exec(source);
  if (videoMatch) {
    const description = translateValue(
      t,
      keyPrefix,
      "description",
      videoMatch[1]
    );
    return `[video:${description}](${videoMatch[2]})`;
  }

  return translateValue(t, keyPrefix, "text", source);
};

export const translateMarkdownContent = (
  code: string,
  content: string,
  t: TranslateFn
) => {
  let translatableIndex = 0;

  return content
    .split(/\r?\n/)
    .map((line) => {
      const source = line.trim();
      if (!source) return line;

      const translatedLine = translateTrimmedLine(
        code,
        translatableIndex,
        source,
        t
      );
      translatableIndex += 1;

      return line.replace(source, translatedLine);
    })
    .join("\n");
};
