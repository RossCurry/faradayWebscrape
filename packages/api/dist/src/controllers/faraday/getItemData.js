import puppeteer from 'puppeteer';
// Or import puppeteer from 'puppeteer-core';
const FARADAY_URL = 'https://www.thisisfaraday.com/';
async function getItemData() {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // Navigate the page to a URL.
    await page.goto(FARADAY_URL);
    // Set screen size.
    await page.setViewport({ width: 1080, height: 1024 });
    // Wait for...
    await page.waitForNetworkIdle();
    await page.waitForSelector('.grid-item');
    // Log page title
    console.log(await page.title());
    // Get items
    const gridItems = await page.$$('.grid-item');
    console.log('!gridItems.length -> ', gridItems.length);
    let soldOutCount = 0;
    const itemsData = await Promise.all(gridItems.map(async (item) => {
        const context = await item.evaluate(el => {
            function parseContext(context) {
                try {
                    return JSON.parse(context);
                }
                catch (error) {
                    console.log('not json', context);
                }
            }
            const context = el.getAttribute('data-current-context');
            const isSoldOut = el.classList.contains('sold-out');
            const linkInfo = context && parseContext(context);
            return { ...linkInfo, isSoldOut };
            // return context && typeof context === 'string' ? JSON.parse(context) : null
        });
        if (context.isSoldOut)
            ++soldOutCount;
        return context;
    }));
    console.log('!itemsData -> ', itemsData.length, soldOutCount);
    await browser.close();
    return itemsData;
}
export default getItemData;
