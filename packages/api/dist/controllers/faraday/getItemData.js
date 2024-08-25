import puppeteer from 'puppeteer';
// Or import puppeteer from 'puppeteer-core';
const FARADAY_URL = 'https://www.thisisfaraday.com/';
async function getItemData() {
    // Launch the browser and open a new blank page
    // const showInBrowser = { headless: false } // launch config for debugging
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
        /**
         * Browser context. methods are executed in the browser, not node
         */
        const context = await item.evaluate(el => {
            let parseError;
            function parseContext(context) {
                if (!context.length)
                    return null;
                try {
                    const cleanString = context.replaceAll('\n', '').replaceAll('\t', '');
                    const parsed = JSON.parse(cleanString);
                    parseError = undefined;
                    return parsed;
                }
                catch (error) {
                    parseError = { message: 'not json', context };
                }
            }
            // TODO get category from classList
            const context = el.getAttribute('data-current-context');
            const isSoldOut = el.classList.contains('sold-out');
            const fullCategoryString = Array.from(el.classList.values()).find(val => val.includes('category'));
            // remove 'category-' from the string
            const category = fullCategoryString?.slice(fullCategoryString.indexOf('-') + 1);
            const linkInfo = context && parseContext(context);
            return {
                id: linkInfo?.id,
                title: linkInfo?.title,
                productType: linkInfo?.productType,
                isSoldOut: isSoldOut,
                category: category || fullCategoryString,
                sourceContext: context,
                parseError: parseError
            };
            // return context && typeof context === 'string' ? JSON.parse(context) : null
        });
        if (context.isSoldOut)
            ++soldOutCount;
        return context;
    }));
    const cleanItems = itemsData.filter(item => !item.parseError);
    const errorItems = itemsData.filter(item => !!item.parseError);
    console.log('!itemsData -> ', itemsData.length, soldOutCount);
    console.log('!errorItems -> ', { length: errorItems.length, errorItems });
    await browser.close();
    return {
        cleanItems,
        errorItems
    };
}
export default getItemData;
