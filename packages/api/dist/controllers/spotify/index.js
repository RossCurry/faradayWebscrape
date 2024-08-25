import Router from 'koa-router';
import mw from '#middlewares/index.js';
import { redirectToSpotifyAuthorize } from './auth/PKCE/1.codeChallenge.js';
const spotifyRouter = new Router();
spotifyRouter.post("/api/spotify/albums", mw.faraday.getFaradayStockMissingSpotifyInfo, mw.auth.getClientCredentialToken, mw.spotify.getAlbumInfoSpotify, // expensive on requests 200+
mw.spotify.setSpotifyAlbumInfo);
spotifyRouter.post("/api/spotify/tracks", mw.spotify.getSpotifyAlbumInfo, // from db
mw.auth.getClientCredentialToken, mw.spotify.getSpotifyTracksInfo, // from spoti api
mw.spotify.setSpotifyTrackInfo);
spotifyRouter.post('/api/spotify/playlist/create', 
// TODO add accessToken to ctx.state
// async (ctx: AppContext, next: Application.Next) => {
//   const accessToken = ctx.body && typeof ctx.body === 'object' && 'accessToken' in ctx.body && ctx.body.accessToken || undefined;
//   console.log('!body -> ', ctx.body);
//   console.log('!accessToken -> ', accessToken);
//   ctx.state.accessToken = accessToken
//   next()
// },
mw.spotify.CreatePlaylist, mw.spotify.PopulatePlaylist);
/**
 * main request from UI to send code verification to spoti auth
 * & redirect FE to the spoti auth
 */
spotifyRouter.get('/api/spotify/connect', async (ctx, _next) => {
    const { authUrl: spotifyAuthUrl, codeVerifier: notEncoded } = await redirectToSpotifyAuthorize();
    // We need this for the authTokenRequest
    ctx.services.codeVerifier.set(notEncoded);
    ctx.set('Content-Type', 'application/json');
    ctx.set('location', spotifyAuthUrl.toString());
    ctx.status = 201; // created
});
/**
 * Spoti Auth redirects user to here
 * We only get the code from the url redirect from Spotify
 * We need the codeChallenge from the previous connect step
 */
spotifyRouter.get("/api/spotify/redirect", mw.auth.getPCKECredentialsToken, // get code
mw.spotify.getCurrentUser, // get user info
mw.spotify.CreatePlaylist, // user info needed for playlist creation
mw.spotify.PopulatePlaylist);
/**
 * Testing spotfiy search single album
 */
spotifyRouter.get("/api/spotify/search", mw.auth.getClientCredentialToken, mw.spotify.searchSingleTitle);
export default spotifyRouter;
