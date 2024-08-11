import Application from 'koa'
import Router from "koa-router"
import CodeVerifier from '#controllers/spotify/auth/CodeVerifier.js'
import Token from '#controllers/spotify/auth/Token.js'
import readFromDisk from '#middlewares/readFromDisk.js'
import { redirectToSpotifyAuthorize } from '#controllers/spotify/auth/PKCE/1.codeChallenge.js'
import { getTokenPCKE } from '#controllers/spotify/auth/PKCE/2.requestUserAuth.js'
import { SpotifyAlbumTracksResponse, SpotifyPlaylist } from '#controllers/spotify/spotify.types.js'
import { getClientCredentialToken } from '#middlewares/auth/clientCredentials/auth.js'
import getAlbumInfoSpotify, { SpotifySearchResult } from '#middlewares/getAlbumInfo.js'
import scrapeFaradayStock from '#middlewares/scrapeFaradayStock.js'
import PopulatePlaylist from '#middlewares/PopulatePlaylist.js'
import writeToDisk from '#middlewares/writeToDisk.js'
import CreatePlaylist from '#middlewares/CreatePlaylist.js'
import MongoDB from '#services/mongodb/index.js'
import { FaradayItemData } from '#controllers/faraday/getItemData.js'
import setFaradayStock from '#middlewares/setFaradayStock.js'
import getFaradayStock from '#middlewares/getFaradayStock.js'
import setSpotifyAlbumInfo from '#middlewares/setSpotifyAlbumInfo.js'
import getSpotifyAlbumInfo from '#middlewares/getSpotifyAlbumInfo.js'
import getSpotifyTracksInfo from '#middlewares/getSpotifyTracksInfo.js'
import setSpotifyTrackInfo from '#middlewares/setSpotifyTrackInfo.js'


// const codeVerifier = new CodeVerifier()
// export const userToken = new Token()

export interface AppState extends Application.DefaultState {
  accessToken?: string | null,
  playlist: SpotifyPlaylist | undefined,
  playlistInfo?: Record<string, any>,
  data: {
    spotifyTrackInfo?: Array<{tracks: SpotifyAlbumTracksResponse, album: SpotifySearchResult}>,
    spotifyAlbumInfo?: SpotifySearchResult[],
    searchResults?: Array<{
      faraday: FaradayItemData,
      spotify: SpotifySearchResult | undefined
    }>,
    faraday?: FaradayItemData[]
  },
}
export interface AppContext extends Application.DefaultContext {
  state: AppState,
  services: {
    codeVerifier: CodeVerifier;
    mongo: MongoDB;
    token: Token;
  }
} 

type AppParamContext = Application.ParameterizedContext<AppState>
// type App = Application<AppState, AppContext>

const services = {
  codeVerifier: new CodeVerifier(),
  mongo: new MongoDB(),
  token: new Token()
}

const router = new Router<AppState, AppContext>()


router.use(// initialize services
  (async (ctx, next) => {
    console.log('!initialize services -> ');
    ctx.state.data = {}
    ctx.services = services
   await next()
  })
)

/**
 * Home
 */
// router.get('/api/albums', 
//   readFromDisk,
//   async (ctx: AppContext, _next: Application.Next) => {
//     const { spotifyAlbumInfo } = ctx.state.data;
//     ctx.body = spotifyAlbumInfo
//     ctx.status = 200
//   }
// )
router.post('/api/playlist/create', 
  async (ctx: AppContext, next: Application.Next) => {
    const accessToken = ctx.body && typeof ctx.body === 'object' && 'accessToken' in ctx.body && ctx.body.accessToken || undefined;
    console.log('!body -> ', ctx.body);
    console.log('!accessToken -> ', accessToken);
    ctx.state.accessToken = accessToken
    next()
  },
  CreatePlaylist,
  PopulatePlaylist,
) 

/**
 * request from UI to send code verification to spoti auth
 */
router.get('/connect', async (ctx: AppContext, _next: Application.Next) => {
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
  async (ctx: AppContext, next: Application.Next) => {
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
  CreatePlaylist,
  PopulatePlaylist,
  // getFaradayStock,
  // TODO dont make so many calls to spoti
  // getAlbumInfo,
  // writeToDisk,
  // TODO read from disk
  // readFromDisk,
  // CreatePlaylist,
  /**
   * This MW should populate the newplaylist
   * @param ctx 
   * @param _next 
   */
  // async (ctx: AppContext, _next: Application.Next) => {
  //   const newPlaylist: SpotifyPlaylist | undefined = ctx.state.playlist
  //   console.log('!newPlaylist -> ', newPlaylist);
  //   ctx.redirect(`http://localhost:3000/albums.html?accessToken=${ctx.state.accessToken}`)
  // }
)

/**
 * Seems like we won't use this.
 */
router.get("/callback", (ctx: AppContext, _next: Application.Next) => {
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
  scrapeFaradayStock,
  getAlbumInfoSpotify,
  writeToDisk,
  CreatePlaylist,
  // AddToPlaylist,
  () => {
    return
  },
  (ctx: AppContext, _next: Application.Next) => {
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
router.get("/api/faraday/albums",
  scrapeFaradayStock,
  setFaradayStock,
)

router.post("/api/spotify/albums",
  getFaradayStock,
  getClientCredentialToken,
  getAlbumInfoSpotify, // expensive on requests 200+
  setSpotifyAlbumInfo,
)

router.post("/api/spotify/tracks",
  getSpotifyAlbumInfo, // from db
  getClientCredentialToken, 
  getSpotifyTracksInfo, // from spoti api
  setSpotifyTrackInfo
)

async function test(ctx: AppParamContext, _next: Application.Next) {
  ctx.body = { foo: 'bar' }
}

export default router;
