const fs = require('fs');
const path = require('path');
const matter = require('gray-matter'); // 用来解析 YAML 头部

const { typeMapping, tagMapping, techMapping } = require('../src/data/static/mappingData.json')
const { tagStack, techStack } = require('../src/data/static/stackData.json')

// 分类函数，用来根据 deck 对 tag 或 tech 进行分类
function categorizeItems(items, deck, mapping) {
    const categorizedItems = [];

    Object.keys(deck).forEach(category => {
        const categorized = deck[category].map(code => {
            const cleanCode = code.trim()
            const item = items.find(item => item.parameter === cleanCode);
            return item ? { parameter: cleanCode, name: mapping[cleanCode] || cleanCode } : null;
        }).filter(item => item !== null);

        if (categorized.length > 0) {
            categorizedItems.push({
                name: category,
                parameter: category,
                children: categorized
            });
        }
    });

    return categorizedItems;
}

// 解析日期，返回标准日期对象或标记为长期
function parseDate(dateStr) {
    const longTermRegex = /^(\d{4})至今$/;
    const match = longTermRegex.exec(dateStr);
    if (match) {
        return { type: 'long-term', startYear: parseInt(match[1], 10) };
    }

    // 假设日期格式为 "YYYY-MM" 或 "YYYY-MM-DD"
    const date = new Date(dateStr);
    if (!isNaN(date)) {
        return { type: 'specific', date };
    }

    return { type: 'unknown' };
}

// 解析并生成详细图片路径
function getDetailImages(projectCode) {
    const detailsFolderPath = path.join(process.cwd(), `public/assets/projects/${projectCode}/details`);
    if (!fs.existsSync(detailsFolderPath)) {
        console.warn(`Details folder does not exist for project code: ${projectCode}`);
        return [];
    }

    const allowedExtensions = ['.webp'];
    const files = fs.readdirSync(detailsFolderPath);

    // 过滤出图片文件，并按数字顺序排序
    const imageFiles = files
        .filter(file => allowedExtensions.includes(path.extname(file).toLowerCase()))
        .sort((a, b) => {
            const numA = parseInt(path.parse(a).name, 10);
            const numB = parseInt(path.parse(b).name, 10);
            return numA - numB;
        });

    // 生成规范化的图片路径
    const imagePaths = imageFiles.map(file => `/assets/projects/${projectCode}/details/${file}`);
    return imagePaths;
}

// 定义函数，生成文档结构树的平面数据
function generateFlatStructure(folderPath) {
    const files = fs.readdirSync(folderPath);
    const flatStructure = [];
    let allTags = [];
    let allTechs = [];
    let allDates = [];
    let allTypes = [];

    files.forEach(file => {
        const fullPath = path.join(folderPath, file);
        const fileNameWithoutExtension = path.parse(file).name; // 去掉文件扩展名

        // 读取文件内容并提取 YAML 头部
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data } = matter(fileContents);

        const code = fileNameWithoutExtension;

        const mappedTags = (data.tags || []).map(tag => tagMapping[tag] || tag);
        const mappedTechs = (data.tech || []).map(tech => techMapping[tech] || tech);
        const mappedTypes = typeMapping[data.type] || data.type

        if (mappedTags.length > 0) {
            allTags = allTags.concat(data.tags);
        }

        if (mappedTechs.length > 0) {
            allTechs = allTechs.concat(data.tech)
        }

        const dateToYear = (date) => {
            const parsedDate = new Date(date);
            const year = parsedDate.getUTCFullYear();
            let output = "";

            if (Number.isNaN(year)) { // 或使用 isNaN(year)
                output = "长期";
            } else {
                output = year;
            }

            return output;
        }

        allDates = allDates.concat(dateToYear(data.date)).sort()

        if (mappedTypes.length > 0) {
            allTypes = allTypes.concat(data.type)
        }

        const detailImages = getDetailImages(code);

        // 添加当前文件到平面结构中
        flatStructure.push({
            code: code,
            title: data.title || fileNameWithoutExtension,
            description: data.description || '这篇文章暂缺说明',
            date: String(data.date),
            year: (new Date(data.date)).getUTCFullYear() || "长期",
            month: (new Date(data.date)).getMonth() + 1 || "长期",
            type: data.type,
            tags: data.tags,
            tech: data.tech,
            link: data.link || null,
            route: `/markdown/${code}.md`,
            poster: `/assets/projects/${code}/poster.webp`,
            thumbnail: `/assets/projects/${code}/thumbnail.webp`,
            banner: `/assets/projects/${code}/banner.webp`,
            details: detailImages
        });
    }
    );

    const uniqueTags = [...new Set(allTags)].map(tag => ({
        parameter: tag,
        name: tagMapping[tag] || tag
    }));

    const uniqueTechs = [...new Set(allTechs)].map(tech => ({
        parameter: tech,
        name: techMapping[tech] || tech
    }));

    const uniqueTypes = [...new Set(allTypes)].map(type => ({
        parameter: type,
        name: typeMapping[type] || type
    }))

    const uniqueDates = [...new Set(allDates)].map(date => ({
        parameter: String(date),
        name: String(date)
    }))

    // 根据 deck 分类
    const categorizedTags = categorizeItems(uniqueTags, tagStack, tagMapping);
    const categorizedTechs = categorizeItems(uniqueTechs, techStack, techMapping);

    return { flatStructure, categorizedTags, categorizedTechs, uniqueDates, uniqueTypes };
}

// 生成按日期由新到旧排序的前八个项目
function generateYearlyProjects(flatStructure) {
    // 先过滤出有有效日期的项目，并解析日期
    const projectsWithDate = flatStructure.map(project => {
        const parsedDate = parseDate(project.date);
        if (parsedDate.type === 'long-term') {
            return {
                project,
                date: new Date(parsedDate.startYear, 0, 1), // 将长期项目的开始年份作为日期
            };
        } else if (parsedDate.type === 'specific') {
            return {
                project,
                date: parsedDate.date
            };
        } else {
            return null; // 日期未知，过滤掉
        }
    }).filter(item => item !== null);

    // 按日期从新到旧排序
    projectsWithDate.sort((a, b) => b.date - a.date);

    // 取前八个项目
    const latestEightProjects = projectsWithDate.slice(0, 8).map(item => item.project);

    return latestEightProjects;
}

// 生成并保存 JSON 文件
function generateAndSaveStructure(folderPath, outputFileName) {
    const { flatStructure, categorizedTags, categorizedTechs, uniqueDates, uniqueTypes } = generateFlatStructure(folderPath); // 生成平面结构
    const outputPath = path.join(process.cwd(), `src/data/${outputFileName}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(flatStructure, null, 2));
    console.log(`${outputFileName}.json generated successfully at ${outputPath}`);

    // 保存去重后的标签数组到 tags.json 文件
    const tagsOutputPath = path.join(process.cwd(), `src/data/tags.json`);
    fs.writeFileSync(tagsOutputPath, JSON.stringify(categorizedTags, null, 2));
    console.log(`tags.json generated successfully at ${tagsOutputPath}`);

    const techsOutputPath = path.join(process.cwd(), `src/data/techs.json`);
    fs.writeFileSync(techsOutputPath, JSON.stringify(categorizedTechs, null, 2));
    console.log(`techs.json generated successfully at ${techsOutputPath}`);

    const datesOutputPath = path.join(process.cwd(), `src/data/years.json`);
    fs.writeFileSync(datesOutputPath, JSON.stringify(uniqueDates, null, 2));
    console.log(`dates.json generated successfully at ${datesOutputPath}`);

    const typesOutputPath = path.join(process.cwd(), `src/data/types.json`);
    fs.writeFileSync(typesOutputPath, JSON.stringify(uniqueTypes, null, 2));
    console.log(`types.json generated successfully at ${typesOutputPath}`);

    // 生成并保存 yearlyProjects.json 文件
    const yearlyProjects = generateYearlyProjects(flatStructure);
    const yearlyProjectsPath = path.join(process.cwd(), `src/data/recentProjects.json`);
    fs.writeFileSync(yearlyProjectsPath, JSON.stringify(yearlyProjects, null, 2));
    console.log(`yearlyProjects.json generated successfully at ${yearlyProjectsPath}`);
}

// 根目录设置
const documentsPath = path.join(process.cwd(), 'public/markdown');

// 生成并保存独立的 JSON 文件
generateAndSaveStructure(documentsPath, 'projectsMetadata');