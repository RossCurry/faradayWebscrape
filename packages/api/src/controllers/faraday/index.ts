import Router from "koa-router"
import mw from '#middlewares/index.js'
import { getSinglePageData, scrapeThisIsFaraday } from '#controllers/faraday/scrapeThisIsFaraday.js'
import Application from 'koa';
import type { AppContext, AppState } from "../../router.js";
import { user } from "../../constants.js";
import puppeteer from "puppeteer";
const faradayRouter = new Router<AppState, AppContext>()

faradayRouter.post("/api/faraday/albums/update",
  mw.faraday.scrapeFaradayStock,
  mw.faraday.setFaradayStock,
)

/**
 * Test route to scrape a better way
 */
faradayRouter.get("/api/faraday/scrape",
  async (ctx: AppContext, _next: Application.Next) => {
    try {
      const scapedData = await scrapeThisIsFaraday()
      ctx.body = scapedData
      ctx.status = 200
    } catch (error) {
      ctx.throw([
        500,
        'Error scraping data',
        error
      ])
    }
  }
)

faradayRouter.post("/api/faraday/scrape",
  async (ctx: AppContext, _next: Application.Next) => {
    const { url } = ctx.request.body as any
    if (!url) throw new Error('No url field in request')
    try {
      const browser = await puppeteer.launch()
      const scapedData = await getSinglePageData(browser, { link: url, linkLabel: ''})
      ctx.body = scapedData
      ctx.status = 200
    } catch (error) {
      ctx.throw([
        500,
        'Error scraping data',
        error
      ])
    }
  }
)

/**
 * Return a json list of faraday albums available on spotify
 */
faradayRouter.get("/api/faraday/albums",
  async (ctx: AppContext, _next: Application.Next) => {
    const { mongo } = ctx.services
    if (!mongo) throw new Error('No mongo object found')
    try {
      const spotifyData = await mongo.spotify?.getSpotifyAlbumData({})
      console.log('!spotifyData length-> ', spotifyData?.length);
      ctx.status = 200
      ctx.body = spotifyData;
    } catch (error) {
      ctx.throw([500, error])
    }
  }
)

/**
 * Return a json list of faraday albums in batches
 */
faradayRouter.get("/api/faraday/albums/batch",
  async (ctx: AppContext, _next: Application.Next) => {
    const { mongo } = ctx.services
    if (!mongo) throw new Error('No mongo object found')

    const { limit, offset, availability } = ctx.query
    const filters = {
      availability
    } as any
    try {
      const spotifyData = await mongo.spotify?.getSpotifyAlbumData({
        match: {},
        limit: Number(limit),
        offset:Number(offset),
        filters,
      })
      const albumCount = await mongo.spotify?.getSpotifyAlbumDataCount(null, filters)
      ctx.status = 200
      ctx.body = { data: spotifyData, totalCount: albumCount };
    } catch (error) {
      ctx.throw([500, error])
    }
  }
)


faradayRouter.get("/api/faraday/errors",
  mw.faraday.getFaradayErrors,
)

// faradayRouter.post("/api/faraday/update",
//   // (ctx, _next) => {
//   //   ctx.body = 'all good'
//   //   ctx.status = 200
//   // }
//   mw.faraday.scrapeFaradayStock,
//   mw.faraday.setFaradayStock,
//   // TODO add spotify scrape

// )


export default faradayRouter