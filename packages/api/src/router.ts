import Application from 'koa'
import Router from "koa-router"
import { getTokenMw } from "./spotify/middlewares/auth/clientCredentials/auth.js"
import { getCurrentUser } from './spotify/users/users.js'
import getFaradayStock from './spotify/middlewares/getFaradayStock.js'
import getAlbumInfo, { ProjectionResultsSingle } from './spotify/middlewares/getAlbumInfo.js'
import writeToDisk from './spotify/middlewares/writeToDisk.js'
import createPlaylist from './spotify/middlewares/CreatePlaylist.js'
import { getTokenPCKE } from './spotify/auth/PKCE/2.requestUserAuth.js'
import { redirectToSpotifyAuthorize } from './spotify/auth/PKCE/1.codeChallenge.js'
import CodeVerifier from './spotify/auth/CodeVerifier.js'
import Token from './spotify/auth/Token.js'
import { SpotifyPlaylist } from './spotify/spotify.types.js'
import readFromDisk from './spotify/middlewares/readFromDisk.js'
const router = new Router()
const codeVerifier = new CodeVerifier()
export const userToken = new Token()

/**
 * Home
 */
router.get('/api/albums', 
  readFromDisk,
  async (ctx: Application.ParameterizedContext, _next: Application.Next) => {
    const { spotifyAlbumInfo } = ctx.state.data;
    ctx.body = spotifyAlbumInfo
    ctx.status = 200
  }
)
router.post('/api/playlist/create', 
  readFromDisk,
  async (ctx: Application.ParameterizedContext, next: Application.Next) => {
    const accessToken = ctx.body && typeof ctx.body === 'object' && 'accessToken' in ctx.body && ctx.body.accessToken || undefined;
    console.log('!body -> ', ctx.body);
    console.log('!accessToken -> ', accessToken);
    console.log('!userToken.get() -> ', userToken.get());
    ctx.state.accessToken = accessToken
    next()
  },
  createPlaylist, 
  async (ctx: Application.ParameterizedContext, _next: Application.Next) => {
    const spotifyAlbumInfo =  ctx.state.data.spotifyAlbumInfo
    const playlist = ctx.state.playlist
    const playlistId = playlist.id
    const playlistEndpoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`
    const body = {
      // example data
      // uris: ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh","spotify:track:1301WleyT98MSxVHPZCA6M", "spotify:episode:512ojhOuo1ktJprKbVcKyQ"],
      // TODO albums dont seem to add
      uris: spotifyAlbumInfo.map((album: ProjectionResultsSingle) => album!.uri),
      position: 0
    }
    const accessToken = ctx.state.accessToken || userToken.get()
    const authString = `Bearer ${accessToken}`
    console.log('!playlistEndpoint -> ', playlistEndpoint);
    console.log('!authString -> ', authString);
    console.log('!body -> ', body);
    try {
      const response = await fetch(playlistEndpoint, {
        method: 'POST',
        headers: {
         'Content-Type': 'application/json',
          Authorization: authString
        },
        body: JSON.stringify(body)
      })
      if (response.ok){
        ctx.body = await response.json()
        ctx.status = 200
        return;
      }
      throw new Error(`Something unknown went wrong adding tracks to playlist ${JSON.stringify(response)}`)
    } catch (error) {
      throw error
    }
  }
)

/**
 * request from UI to send code verification to spoti auth
 */
router.get('/connect', async (ctx: Application.ParameterizedContext, _next: Application.Next) => {
  const { authUrl: spotifyAuthUrl, codeVerifier: notEncoded } = await redirectToSpotifyAuthorize()
  // We need this for the authTokenRequest
  codeVerifier.set(notEncoded)
  ctx.set('Content-Type', 'application/json');
  ctx.set('location', spotifyAuthUrl.toString());
  ctx.status = 201 // created
})


type PKCE_RES = {
  access_token: string,
  token_type: 'Bearer',
  expires_in: number, // 3600
  refresh_token: string,
  scope: string
}

// Test
/**
 * We only get the code from the url redirect from Spotify
 * We need the codeChallenge from the previous connect step
 */
router.get("/redirect", 
  async (ctx: Application.ParameterizedContext, next: Application.Next) => {
    const params = new URLSearchParams(ctx.querystring)
    const code = params.get('code')
    const codeChallenge = codeVerifier.get()
    if (!code || !codeChallenge) throw new Error('Missing code or codeChallenge from redirect')
    try {
      const token: PKCE_RES = await getTokenPCKE(code, codeChallenge)
      console.log('!getTokenPCKE response -> ', token);
      userToken.set(token)
      ctx.state.accessToken = token.access_token
    } catch (error) {
      ctx.body = {code} 
    }
    next()
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
  async (ctx: Application.ParameterizedContext, _next: Application.Next) => {
    const newPlaylist: SpotifyPlaylist = ctx.state.playlist
    console.log('!newPlaylist -> ', newPlaylist);
    ctx.redirect(`http://localhost:3000/albums.html?accessToken=${ctx.state.accessToken}`)
  }
)

/**
 * Seems like we won't use this.
 */
router.get("/callback", (ctx: Application.ParameterizedContext, _next: Application.Next) => {
  const params = new URLSearchParams(ctx.querystring)
  console.log('!callback params -> ', params);
  console.log('!ctx.req -> ', ctx.req);
  
  ctx.body = "hello callback"
})


/**
 * Using this route we cannot make user scoped requests.
 */
router.get("/oldRoute",
  getTokenMw,
  // getCurrentUser,
  getFaradayStock,
  getAlbumInfo,
  writeToDisk,
  createPlaylist,
  // AddToPlaylist,
  () => {
    return
  },
  (ctx: Application.ParameterizedContext, _next: Application.Next) => {
    const playlistInfo = ctx.state.playlistInfo
    console.log('playlistInfo', playlistInfo)

    try {
      ctx.body = playlistInfo
      ctx.status = 200
    } catch (error) {
      ctx.body = { message: 'Something went wrong', error }
      ctx.status = 500
    }
  })

export default router;
