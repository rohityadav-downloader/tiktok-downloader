import { chromium } from 'playwright';

let browser = null;

async function getBrowser() {
    if (!browser) {
        browser = await chromium.launch({
            headless: true,
            ignoreDefaultArgs: ['--headless'],
            args: [
                '--headless=new',                 // Utilize the latest headless mode for improved performance
                '--no-sandbox',                   // Disable sandboxing; necessary in containerized environments
                '--disable-setuid-sandbox',       // Additional security measure for non-root users
            ],
        });

    }
    return browser;
}

export default async function get_download_link(url) {
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.goto('https://snaptik.app/en2');
    page.locator('.button.is-link.continue-web').click();

    await page
        .getByLabel('name')
        .fill(url);

    await page.getByLabel('Get').click();

    const downloadLink = await page
        .locator('.download-file.button')
        .getAttribute('href');
    return downloadLink;
};

process.on('exit', async () => {
    if (browser) await browser.close();
});