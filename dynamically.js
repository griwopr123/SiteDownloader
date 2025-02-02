const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function downloadPageWithPuppeteer(url, outputDir) {
    const browser = await puppeteer.launch({ 
        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
        headless: true 
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' }); 

  
    const html = await page.content();
    const htmlFilePath = path.join(outputDir, 'index.html');
    fs.writeFileSync(htmlFilePath, html);
    console.log(`Страница сохранена в ${htmlFilePath}`);


    const resources = await page.evaluate(() => {
        const resources = [];
        document.querySelectorAll('link[href], script[src], img[src]').forEach(element => {
            const src = element.src || element.href;
            if (src) resources.push(src);
        });
        return resources;
    });

    for (const resourceUrl of resources) {
        try {
            const response = await page.goto(resourceUrl, { waitUntil: 'networkidle2' });
            const buffer = await response.buffer();
            const fileName = path.basename(new URL(resourceUrl).pathname);
            const filePath = path.join(outputDir, fileName);
            fs.writeFileSync(filePath, buffer);
            console.log(`Ресурс сохранен: ${filePath}`);
        } catch (error) {
            console.error(`Ошибка при загрузке ресурса: ${error}`);
        }
    }

    await browser.close();
}

async function main() {
    const url = 'https:'; 
    const outputDir = './downloaded-dynamically-site';

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    await downloadPageWithPuppeteer(url, outputDir);
}

main();