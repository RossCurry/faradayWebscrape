import Application from 'koa';
import Router from 'koa-router';
import mw from '#middlewares/index.js'
import router, { AppContext, AppState } from "../../router.js";
import { redirectToSpotifyAuthorize } from './auth/PKCE/1.codeChallenge.js';
const spotifyRouter = new Router<AppState, AppContext>()

// // Temporary Route to update missing genre field for existing
// spotifyRouter.post("/api/spotify/albums/update/properties",
//   mw.faraday.getFaradayStockMissingSpotifyInfo,
//   mw.auth.getClientCredentialToken,
//   mw.spotify.getAlbumsAndSetProperties, // get and set genre
//   // mw.spotify.setSpotifyAlbumInfo,
// )

spotifyRouter.post("/api/spotify/albums/update",
  mw.faraday.getFaradayStockMissingSpotifyInfo,
  mw.auth.getClientCredentialToken,
  mw.spotify.getAlbumInfoSpotify, // expensive on requests 200+
  mw.spotify.setSpotifyAlbumInfo,
)

spotifyRouter.post("/api/spotify/tracks/update",
  mw.spotify.getSpotifyAlbumInfo, // from db
  mw.auth.getClientCredentialToken, 
  mw.spotify.getSpotifyTracksInfo, // from spoti api
  mw.spotify.setSpotifyTrackInfo
)

spotifyRouter.post('/api/spotify/playlist/create', 
  // TODO add accessToken to ctx.state
  // async (ctx: AppContext, next: Application.Next) => {
  //   const accessToken = ctx.body && typeof ctx.body === 'object' && 'accessToken' in ctx.body && ctx.body.accessToken || undefined;
  //   console.log('!body -> ', ctx.body);
  //   console.log('!accessToken -> ', accessToken);
  //   ctx.state.accessToken = accessToken
  //   next()
  // },
  mw.spotify.CreatePlaylist,
  mw.spotify.PopulatePlaylist,
) 

/**
 * main request from UI to send code verification to spoti auth
 * & redirect FE to the spoti auth
 */
spotifyRouter.get('/api/spotify/connect', async (ctx: AppContext, _next: Application.Next) => {
  const { authUrl: spotifyAuthUrl, codeVerifier: notEncoded } = await redirectToSpotifyAuthorize()
  // We need this for the authTokenRequest
  ctx.services.codeVerifier.set(notEncoded)
  ctx.set('Content-Type', 'application/json');
  ctx.set('location', spotifyAuthUrl.toString());
  ctx.status = 201 // created
})

/**
 * Spoti Auth redirects user to here
 * We only get the code from the url redirect from Spotify
 * We need the codeChallenge from the previous connect step
 */
spotifyRouter.post("/api/spotify/redirect", 
  mw.auth.getPCKECredentialsToken, // use code from url
  mw.spotify.getCurrentUser, // get user info
  mw.spotify.CreatePlaylist, // user info needed for playlist creation
  mw.spotify.PopulatePlaylist,
)

/**
 * Testing spotfiy search single album
 */
spotifyRouter.get("/api/spotify/search",
  mw.auth.getClientCredentialToken,
  mw.spotify.searchSingleTitle
)

/**
 * Return a json list of spotify track info available by album id
 */
spotifyRouter.get("/api/spotify/album/:id/tracks",
  async (ctx: AppContext & { params: Record<string, unknown> }, _next: Application.Next) => {
    const { mongo } = ctx.services
    if (!mongo) throw new Error('No mongo object found')
    try {
      const { id } = ctx.params
      console.log('!path -> ', id);
      const spotifyData = await mongo.getSpotifyTracksListByAlbumId(id as string)
      ctx.status = 200
      ctx.body = { tracklist: spotifyData };
    } catch (error) {
      console.error('Error in middleware:', error);
      ctx.status = 500;
      ctx.body = 'Internal Server Error';
    }
  }
)


export default spotifyRouter;