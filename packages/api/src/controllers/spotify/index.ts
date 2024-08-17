import mw from '#middlewares/index.js'
import Application from 'koa';
import router, { AppContext } from "../../router.js";
import { redirectToSpotifyAuthorize } from './auth/PKCE/1.codeChallenge.js';

router.post("/api/spotify/albums",
  mw.faraday.getFaradayStock,
  mw.auth.getClientCredentialToken,
  mw.spotify.getAlbumInfoSpotify, // expensive on requests 200+
  mw.spotify.setSpotifyAlbumInfo,
)

router.post("/api/spotify/tracks",
  mw.spotify.getSpotifyAlbumInfo, // from db
  mw.auth.getClientCredentialToken, 
  mw.spotify.getSpotifyTracksInfo, // from spoti api
  mw.spotify.setSpotifyTrackInfo
)

router.post('/api/spotify/playlist/create', 
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
router.get('/api/spotify/connect', async (ctx: AppContext, _next: Application.Next) => {
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
router.get("/api/spotify/redirect", 
  mw.auth.getPCKECredentialsToken, // get code
  mw.spotify.getCurrentUser, // get user info
  mw.spotify.CreatePlaylist, // user info needed for playlist creation
  mw.spotify.PopulatePlaylist,
)