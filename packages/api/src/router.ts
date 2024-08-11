import Application from 'koa'
import Router from "koa-router"
import CodeVerifier from '#controllers/spotify/auth/CodeVerifier.js'
import Token from '#controllers/spotify/auth/Token.js'
import readFromDisk from '#middlewares/readFromDisk.js'
import { redirectToSpotifyAuthorize } from '#controllers/spotify/auth/PKCE/1.codeChallenge.js'
import { getTokenPCKE } from '#controllers/spotify/auth/PKCE/2.requestUserAuth.js'
import { SpotifyPlaylist } from '#controllers/spotify/spotify.types.js'
import { getClientCredentialToken } from '#middlewares/auth/clientCredentials/auth.js'
import getAlbumInfo from '#middlewares/getAlbumInfo.js'
import getFaradayStock from '#middlewares/getFaradayStock.js'
import PopulatePlaylist from '#middlewares/PopulatePlaylist.js'
import writeToDisk from '#middlewares/writeToDisk.js'
import CreatePlaylist from '#middlewares/CreatePlaylist.js'
import MongoDB from '#services/mongodb/index.js'
import { FaradayItemData } from '#controllers/faraday/getItemData.js'

const router = new Router()
// const codeVerifier = new CodeVerifier()
// export const userToken = new Token()

interface AppState {
  accessToken?: string,
  playlist?: Record<string, any>,
  playlistInfo?: Record<string, any>,
  data: {
    spotifyAlbumInfo?: any,
    searchResults?: any,
    faraday?: FaradayItemData[]
  },
  services: {
    codeVerifier: CodeVerifier;
    mongo: MongoDB;
    token: Token;
  };
}

type AppContext = Application.ParameterizedContext<AppState>

const services = {
  codeVerifier: new CodeVerifier(),
  mongo: new MongoDB(),
  token: new Token()
}


router.use(// initialize services
  (async (ctx: AppContext, next) => {
    console.log('!initialize services -> ');
    ctx.services = services
   await next()
  })
)

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
    // console.log('!userToken.get() -> ', userToken.get());
    ctx.state.accessToken = accessToken
    next()
  },
  CreatePlaylist,
  PopulatePlaylist,
) 

/**
 * request from UI to send code verification to spoti auth
 */
router.get('/connect', async (ctx: Application.ParameterizedContext, _next: Application.Next) => {
  const { authUrl: spotifyAuthUrl, codeVerifier: notEncoded } = await redirectToSpotifyAuthorize()
  // We need this for the authTokenRequest
  ctx.state.codeVerifier.set(notEncoded)
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
    const codeChallenge = ctx.state.codeVerifier.get()
    if (!code || !codeChallenge) throw new Error('Missing code or codeChallenge from redirect')
    try {
      const token: PKCE_RES = await getTokenPCKE(code, codeChallenge)
      console.log('!getTokenPCKE response -> ', token);
      ctx.state.userToken.set(token)
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
  getClientCredentialToken,
  // getCurrentUser,
  getFaradayStock,
  getAlbumInfo,
  writeToDisk,
  CreatePlaylist,
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

/**
* Using this route we cannot make user scoped requests.
*/
router.get("/api/faraday/refresh",
  getFaradayStock,
  (ctx: AppContext, _next: Application.Next) => {
    console.log('!ctx.state -> ', ctx.state)
  },
  // getFaradayStock,
)

export default router;
