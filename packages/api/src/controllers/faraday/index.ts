import Router from "koa-router"
import mw from '#middlewares/index.js'
import Application from 'koa';
import type { AppContext, AppState } from "../../router.js";
import { user } from "../../constants.js";
const faradayRouter = new Router<AppState, AppContext>()

faradayRouter.post("/api/faraday/albums/update",
  mw.faraday.scrapeFaradayStock,
  mw.faraday.setFaradayStock,
)

/**
 * Return a json list of faraday albums available on spotify
 */
faradayRouter.get("/api/faraday/albums",
  async (ctx: AppContext, _next: Application.Next) => {
    const { mongo } = ctx.services
    if (!mongo) throw new Error('No mongo object found')
    try {
      const spotifyData = await mongo.spotify?.getSpotifyAlbumData()
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

    console.log('!ctx.params -> ', ctx.params);
    const { limit, offset, filter } = ctx.query
    const filterParsed = filter && typeof filter === 'string' ? JSON.parse(filter) : {}
    try {
      const spotifyData = await mongo.spotify?.getSpotifyAlbumData(
        null, 
        Number(limit), 
        Number(offset),
        filterParsed,
      )
      const albumCount = await mongo.spotify?.getSpotifyAlbumDataCount(null, filterParsed)
      console.log('!spotify Batch length-> ', spotifyData?.length, albumCount );
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