const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * 递归处理文件夹中的所有图片
 * @param {string} folderPath - 文件夹路径
 */
async function processImagesInFolder(folderPath) {
    // 读取文件夹内容
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
        const fullPath = path.join(folderPath, file);

        // 检查是否为文件夹
        if (fs.statSync(fullPath).isDirectory()) {
            // 递归处理子文件夹
            await processImagesInFolder(fullPath);
        } else {
            // 检查文件是否为图片（扩展名过滤）
            if (/\.(jpe?g|png|gif|tiff)$/i.test(file)) {
                try {
                    // 转换为 .webp 格式
                    const outputPath = fullPath.replace(/\.[^/.]+$/, '.webp');

                    // 使用 sharp 进行图片转换
                    await sharp(fullPath)
                        .resize({ width: 1000, height: null, fit: 'inside' })
                        .toFormat('webp')
                        .toFile(outputPath);

                    console.log(`Converted: ${fullPath} -> ${outputPath}`);
                } catch (err) {
                    console.error(`Error processing ${fullPath}:`, err);
                }
            }
        }
    }
}

// 使用示例
const rootFolder = path.resolve('./public/assets/'); // 替换为目标文件夹路径
processImagesInFolder(rootFolder)
    .then(() => console.log('All images processed!'))
    .catch((err) => console.error('Error during processing:', err));