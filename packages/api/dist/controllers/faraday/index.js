import Router from "koa-router";
import mw from '#middlewares/index.js';
const faradayRouter = new Router();
faradayRouter.post("/api/faraday/albums", mw.faraday.scrapeFaradayStock, mw.faraday.setFaradayStock);
/**
 * Return a json list of faraday albums available on spotify
 */
faradayRouter.get("/api/faraday/albums", async (ctx, _next) => {
    const { mongo } = ctx.services;
    if (!mongo)
        throw new Error('No mongo object found');
    try {
        const spotifyData = await mongo.getSpotifyAlbumData();
        console.log('!spotifyData length-> ', spotifyData.length);
        ctx.status = 200;
        ctx.body = spotifyData;
    }
    catch (error) {
        console.error('Error in middleware:', error);
        ctx.status = 500;
        ctx.body = 'Internal Server Error';
    }
});
// faradayRouter.post("/api/faraday/update",
//   // (ctx, _next) => {
//   //   ctx.body = 'all good'
//   //   ctx.status = 200
//   // }
//   mw.faraday.scrapeFaradayStock,
//   mw.faraday.setFaradayStock,
//   // TODO add spotify scrape
// )
export default faradayRouter;
