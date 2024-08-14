const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
        ],
     });
    console.log("Browser started");

    const page = await browser.newPage();
    await page.goto('https://www.google.com');

    await page.screenshot({ path: 'google.png', fullPage: true });

    console.log('Printscreen tirado com sucesso!');

    await browser.close();
})();
