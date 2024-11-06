import Router from "koa-router";
import mw from '#middlewares/index.js';
const faradayRouter = new Router();
faradayRouter.post("/api/faraday/albums/update", mw.faraday.scrapeFaradayStock, mw.faraday.setFaradayStock);
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
faradayRouter.get("/api/faraday/playlists", async (ctx, _next) => {
    const { mongo } = ctx.services;
    if (!mongo)
        throw new Error('No mongo object found');
    try {
        // TODO use dynamic data once FE is developed
        // const userId = ctx.services.token.currentUser?.id
        const userId = '66b9317f5ffd03bdb76b9647';
        if (!userId)
            throw Error('Cannot get playlist info. No userId given');
        const playlistsData = await mongo.getFaradayPlaylistData(userId);
        console.log('!spotifyData length-> ', playlistsData?.length);
        ctx.status = 200;
        ctx.body = playlistsData;
    }
    catch (error) {
        console.error('Error in middleware:', error);
        ctx.status = 500;
        ctx.body = 'Internal Server Error';
    }
});
export default faradayRouter;
