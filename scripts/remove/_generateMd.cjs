const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { pathToFileURL } = require('url'); // Required for path conversion

// Load translations
let translations;
try {
    translations = require('./translation.json');
    console.log('Translation file loaded successfully.');
} catch (err) {
    console.error('Error loading translation file:', err);
    return;
}

// Function to get the translation of a string
function translate(key) {
    return translations[key] || key; // Return the translated text or the original if not found
}

// Define the folder path where the markdown files will be saved
const outputFolder = path.join(__dirname, 'projectsMarkdown');

// Ensure the output directory exists
if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
    console.log('Output folder created:', outputFolder);
}

// Function to generate markdown for each project
async function generateMarkdown() {
    try {
        // Convert the Windows path to a file URL
        const portfoliosPath = pathToFileURL(path.resolve(__dirname, './PortfolioData.js')).href;

        // Dynamically import PortfolioData.js (ES module)
        const portfoliosModule = await import(portfoliosPath);
        const portfolios = portfoliosModule.default;  // Get the default export
        console.log('Portfolio data loaded successfully.');

        portfolios.forEach((project) => {
            const { id, title, description, date, type, tags, url, txt } = project;

            // Log project details for debugging
            console.log(`Processing project: ${id} - ${title}`);

            // Use translations from the JSON file
            const titleZh = translate(title);
            const descriptionZh = translate(description);
            const txtZh = translate(txt);
            const typeZh = translate(type);
            const tagsZh = tags ? tags.map(tag => translate(tag)) : ['标签1', '标签2']; // Translate each tag

            // Log the translations
            console.log('Title (translated):', titleZh);
            console.log('Description (translated):', descriptionZh);

            // Create the frontmatter
            const frontMatter = matter.stringify('', {
                title: titleZh,
                description: descriptionZh,
                date: date || '2023-10-13', // Default date if not provided
                type: typeZh || '类型A',  // Default type if not provided
                tags: tagsZh,  // Default tags if not provided
                link: url || 'https://example.com'
            });

            // Combine frontmatter with translated text
            const markdownContent = `${frontMatter}\n${txtZh || '这里是项目的详细内容。'}`;

            // Write to .md file
            const fileName = `0${id}.md`;
            const filePath = path.join(outputFolder, fileName);

            try {
                fs.writeFileSync(filePath, markdownContent, 'utf8');
                console.log(`Generated ${fileName}`);
            } catch (err) {
                console.error(`Error writing file ${fileName}:`, err);
            }
        });
    } catch (err) {
        console.error('Error loading PortfolioData.js:', err);
    }
}

// Call the function
generateMarkdown();
