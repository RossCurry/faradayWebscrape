import puppeteer from 'puppeteer';
import pLimit from 'p-limit';
import { FaradayItemData } from './getItemData.js';

const BATCH_LIMIT = undefined
const CONCURRENCY_LIMIT = 5
const limit = pLimit(CONCURRENCY_LIMIT)
// Or import puppeteer from 'puppeteer-core';
const FARADAY_URL = 'https://www.thisisfaraday.com/'

// export type FaradayItemData = {
//   id: string,
//   title?: string,
//   productType: string,
//   isSoldOut: boolean,
//   category: string | undefined,
//   notAvailable?: boolean,
//   sourceContext: string | null,
//   price?: string,
//   link: string,
//   linkLabel: string | null,
//   idTitle: string | undefined,
//   parseError?: { message: 'not json', context: string },
//   spotifyAlbumLink?: string
// }

export async function scrapeThisIsFaraday() {
  // Launch the browser and open a new blank page
  // const showInBrowser = { headless: false } // launch config for debugging
  const browser = await puppeteer.launch({
    headless: true, // Or 'new' for new headless mode
    // Optional: Increase timeout for browser launch if it's very slow
    timeout: 60000, // 60 seconds (default is 30)
    args: [
      '--no-sandbox', // Essential for Docker/Linux environments
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', // Helps with memory issues in some environments
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // If you're really desperate for resources, but can be less stable
      '--disable-gpu' // Often helps on servers without GPUs
    ]
  });
  const page = await browser.newPage();

  // Navigate the page to a URL.
  await page.goto(FARADAY_URL);
  // Set screen size.
  await page.setViewport({ width: 1080, height: 1024 });

  // Wait for...
  await page.waitForNetworkIdle();
  // await page.waitForSelector('.grid-item');
  await page.waitForSelector('.product-list-container');
  // await page.waitForSelector('.product-list-item');

  // Log page title
  console.log(await page.title());

  // Get items page 1
  const gridItemsPage1 = await page.$$('.product-list-item');
  console.log('!gridItemsPage1.length -> ', gridItemsPage1.length);
  const itemsData1 = await parseMainPageItems(browser, gridItemsPage1.slice(0, BATCH_LIMIT))

  // Click the anchor tag to navigate to the next page
  await Promise.all([
    page.click('a.list-pagination-next '), // Replace with the appropriate selector
    page.waitForNavigation({ waitUntil: 'networkidle0' }), // Wait for navigation to complete
    page.waitForSelector('.product-list-container')
  ]);

  // Get items page 2
  const gridItemsPage2 = await page.$$('.product-list-item');
  console.log('!gridItemsPage2.length -> ', gridItemsPage2.length);
  const itemsData2 = await parseMainPageItems(browser, gridItemsPage2.slice(0, BATCH_LIMIT))

  // Merge results
  const itemsData = itemsData1.concat(itemsData2)

  await browser.close();
  return {
    count: itemsData.length,
    itemsData,
  }
}


async function parseMainPageItems(browser: puppeteer.Browser, gridItems: puppeteer.ElementHandle<Element>[]) {
  console.log('!gridItems to process: -> ', gridItems.length);
  const linksData: LinksData[] = []
  try {
    const links = await Promise.all(gridItems.map(async (item) => {
      return getMainPageItemLink(item)
    }));
    console.log('!links to process: -> ', links.length);
    links.forEach(ld => linksData.push(ld))
  } catch (error: any) {
    throw new Error(error.message, { cause: 'Error parsing links from main pages'})
  }
  console.log('!Processing links -> ', linksData.length);
  const data = await Promise.all(linksData.map(async (linkData) => {
    return limit(() => getSinglePageData(browser, linkData))
  }))
  console.log('!Data processed -> ', data.length);
  return data
}

/*
 * Get the links of each item
 */
async function getMainPageItemLink(mainPageItem: puppeteer.ElementHandle<Element>) {
  /**
   * Browser context. methods are executed in the browser, not node
   * we can pass in vars as values to the browser context - no references or functions though
   */
  const context = await mainPageItem.evaluate(el => {
    const [linkEl] = Array.from(el.getElementsByTagName('a'))
    const link = linkEl.href;
    const linkLabel = linkEl.ariaLabel;

    return {
      link: link,
      linkLabel: linkLabel,
    }
  });
  return context;
}
type LinksData = Awaited<ReturnType<typeof getMainPageItemLink>>


/**
 * Get the links of each item
 */
export async function getSinglePageData(browser: puppeteer.Browser, linkData: Awaited<ReturnType<typeof getMainPageItemLink>>) {
  /**
   * Browser context. methods are executed in the browser, not node
   * we can pass in vars as values to the browser context - no references or functions though
   */
  // on the page - get elements and data
  // Open page
  const page = await puppeteerGetPage(browser, linkData.link)
  // Should be 1 per page
  const productMeta = (await page.$$('.product-meta')).at(0)
  const productTitle = await (await page.$$('.product-title')).at(0)?.evaluate(el => el.textContent)
  const productPrice = await (await page.$$('.product-price-value')).at(0)?.evaluate(el => el.textContent?.trim().replaceAll('€', '').trim())
  const productIsSoldout = await (await page.$$('.sold-out')).at(0)?.evaluate(el => el.textContent?.trim())
  const productLinkEls = await page?.$$('a') || [];

  const productLinks = await Promise.all(productLinkEls?.map(async (anchorEl) => {
    const href = await anchorEl.evaluate(el => el.href)
    return href
  }))
  const spotifyAlbumLink = productLinks.find(link => link.startsWith('https://open.spotify.com/') && link.includes('album'))

  const { link, linkLabel } = linkData
  const data: FaradayItemData = {
    id: '',
    title: productTitle || '',
    productType: '',
    isSoldOut: Boolean(productIsSoldout),
    category: null,
    sourceContext: null,
    price: productPrice || '',
    link,
    linkLabel,
    idTitle: null,
    spotifyAlbumLink
  }
  // close page
  await page.close()
  return data
}


async function puppeteerGetPage(browser: puppeteer.Browser, link: string) {
  const page = await browser.newPage();
  await page.goto(link, {
    waitUntil: 'domcontentloaded', // or 'networkidle0', 'load', 'networkidle2'
    timeout: 60000 // Set timeout to 60 seconds (60,000 milliseconds)
  });
  // Log page title
  console.log(await page.title(), ' Pages open: ', (await browser.pages()).length);
  return page
}