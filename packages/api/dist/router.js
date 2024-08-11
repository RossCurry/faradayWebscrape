import Router from "koa-router";
import CodeVerifier from '#controllers/spotify/auth/CodeVerifier.js';
import Token from '#controllers/spotify/auth/Token.js';
import readFromDisk from '#middlewares/readFromDisk.js';
import { redirectToSpotifyAuthorize } from '#controllers/spotify/auth/PKCE/1.codeChallenge.js';
import { getTokenPCKE } from '#controllers/spotify/auth/PKCE/2.requestUserAuth.js';
import { getClientCredentialToken } from '#middlewares/auth/clientCredentials/auth.js';
import getAlbumInfo from '#middlewares/getAlbumInfo.js';
import getFaradayStock from '#middlewares/getFaradayStock.js';
import PopulatePlaylist from '#middlewares/PopulatePlaylist.js';
import writeToDisk from '#middlewares/writeToDisk.js';
import CreatePlaylist from '#middlewares/CreatePlaylist.js';
import MongoDB from '#services/mongodb/index.js';
const router = new Router();
const services = {
    codeVerifier: new CodeVerifier(),
    mongo: new MongoDB(),
    token: new Token()
};
router.use(// initialize services
(async (ctx, next) => {
    console.log('!initialize services -> ');
    ctx.services = services;
    await next();
}));
/**
 * Home
 */
router.get('/api/albums', readFromDisk, async (ctx, _next) => {
    const { spotifyAlbumInfo } = ctx.state.data;
    ctx.body = spotifyAlbumInfo;
    ctx.status = 200;
});
router.post('/api/playlist/create', readFromDisk, async (ctx, next) => {
    const accessToken = ctx.body && typeof ctx.body === 'object' && 'accessToken' in ctx.body && ctx.body.accessToken || undefined;
    console.log('!body -> ', ctx.body);
    console.log('!accessToken -> ', accessToken);
    // console.log('!userToken.get() -> ', userToken.get());
    ctx.state.accessToken = accessToken;
    next();
}, CreatePlaylist, PopulatePlaylist);
/**
 * request from UI to send code verification to spoti auth
 */
router.get('/connect', async (ctx, _next) => {
    const { authUrl: spotifyAuthUrl, codeVerifier: notEncoded } = await redirectToSpotifyAuthorize();
    // We need this for the authTokenRequest
    ctx.state.codeVerifier.set(notEncoded);
    ctx.set('Content-Type', 'application/json');
    ctx.set('location', spotifyAuthUrl.toString());
    ctx.status = 201; // created
});
// Test
/**
 * We only get the code from the url redirect from Spotify
 * We need the codeChallenge from the previous connect step
 */
router.get("/redirect", async (ctx, next) => {
    const params = new URLSearchParams(ctx.querystring);
    const code = params.get('code');
    const codeChallenge = ctx.state.codeVerifier.get();
    if (!code || !codeChallenge)
        throw new Error('Missing code or codeChallenge from redirect');
    try {
        const token = await getTokenPCKE(code, codeChallenge);
        console.log('!getTokenPCKE response -> ', token);
        ctx.state.userToken.set(token);
        ctx.state.accessToken = token.access_token;
    }
    catch (error) {
        ctx.body = { code };
    }
    next();
}, 
// getFaradayStock,
// TODO dont make so many calls to spoti
// getAlbumInfo,
// writeToDisk,
// TODO read from disk
readFromDisk, 
// CreatePlaylist,
/**
 * This MW should populate the newplaylist
 * @param ctx
 * @param _next
 */
async (ctx, _next) => {
    const newPlaylist = ctx.state.playlist;
    console.log('!newPlaylist -> ', newPlaylist);
    ctx.redirect(`http://localhost:3000/albums.html?accessToken=${ctx.state.accessToken}`);
});
/**
 * Seems like we won't use this.
 */
router.get("/callback", (ctx, _next) => {
    const params = new URLSearchParams(ctx.querystring);
    console.log('!callback params -> ', params);
    console.log('!ctx.req -> ', ctx.req);
    ctx.body = "hello callback";
});
/**
 * Using this route we cannot make user scoped requests.
 */
router.get("/oldRoute", getClientCredentialToken, 
// getCurrentUser,
getFaradayStock, getAlbumInfo, writeToDisk, CreatePlaylist, 
// AddToPlaylist,
() => {
    return;
}, (ctx, _next) => {
    const playlistInfo = ctx.state.playlistInfo;
    console.log('playlistInfo', playlistInfo);
    try {
        ctx.body = playlistInfo;
        ctx.status = 200;
    }
    catch (error) {
        ctx.body = { message: 'Something went wrong', error };
        ctx.status = 500;
    }
});
/**
* Using this route we cannot make user scoped requests.
*/
router.get("/api/faraday/refresh", getFaradayStock, (ctx, _next) => {
    console.log('!ctx.state -> ', ctx.state);
});
export default router;
