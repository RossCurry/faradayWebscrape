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
    // Get items page 1
    const gridItemsPage1 = await page.$$('.grid-item');
    console.log('!gridItemsPage1.length -> ', gridItemsPage1.length);
    const itemsPage1 = await getItems(gridItemsPage1);
    // Click the anchor tag to navigate to the next page
    await Promise.all([
        page.click('a.list-pagination-next '), // Replace with the appropriate selector
        page.waitForNavigation({ waitUntil: 'networkidle0' }), // Wait for navigation to complete
        page.waitForSelector('.grid-item')
    ]);
    // Get items page 2
    const gridItemsPage2 = await page.$$('.grid-item');
    console.log('!gridItemsPage2.length -> ', gridItemsPage2.length);
    const itemsPage2 = await getItems(gridItemsPage2);
    const itemsData = itemsPage1.concat(itemsPage2);
    const cleanItems = itemsData.filter(item => !item.parseError);
    const errorItems = itemsData.filter(item => !!item.parseError);
    console.log('!itemsData -> ', itemsData.length);
    console.log('!errorItems -> ', { length: errorItems.length, errorItems });
    await browser.close();
    return {
        cleanItems,
        errorItems
    };
}
export default getItemData;
async function getItems(gridItems) {
    let soldOutCount = 0;
    return await Promise.all(gridItems.map(async (item) => {
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
            const [priceEl] = el.getElementsByClassName('product-price');
            const price = priceEl?.textContent?.replaceAll('\n', '').replace('€', '').trim();
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
                price: price || '',
                parseError: parseError
            };
            // return context && typeof context === 'string' ? JSON.parse(context) : null
        });
        if (context.isSoldOut)
            ++soldOutCount;
        return context;
    }));
}
