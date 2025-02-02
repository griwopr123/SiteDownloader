
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');


async function downloadPage(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Ошибка при загрузке страницы: ${error}`);
    }
}




function savePage(html, filePath) {
    fs.writeFileSync(filePath, html);
    console.log(`Страница сохранена в ${filePath}`);
}

async function downloadResources(html, baseUrl, directory) {
    const $ = cheerio.load(html);
    const resources = [];

    $('link[href], script[src], img[src]').each((i, elem) => {
        const src = $(elem).attr('src') || $(elem).attr('href');
        if (src && !src.startsWith('http')) {
            resources.push(new URL(src, baseUrl).href);
        } else if (src) {
            resources.push(src);
        }
    });

    for (const resourceUrl of resources) {
        try {
            const response = await axios.get(resourceUrl, { responseType: 'arraybuffer' });
            const fileName = path.basename(resourceUrl);
            const filePath = path.join(directory, fileName);
            fs.writeFileSync(filePath, response.data);
            console.log(`Ресурс сохранен: ${filePath}`);
        } catch (error) {
            console.error(`Ошибка при загрузке ресурса: ${error}`);
        }
    }
}


async function main() {
    const url = 'https://'; 
    const outputDir = './downloaded-site2';

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const html = await downloadPage(url);
    const htmlFilePath = path.join(outputDir, 'index.html');
    savePage(html, htmlFilePath);

    await downloadResources(html, url, outputDir);
}

main();