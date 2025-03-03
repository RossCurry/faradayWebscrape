import Application from 'koa'
import Router from "koa-router"

// services
import MongoDB from '#services/mongodb/Mongo.js'
import CodeVerifier from '#services/codeVerifier/CodeVerifier.js'
import Token from '#services/token/Token.js'

// types
import type { SpotifyAlbumTracksResponse, SpotifyCoverImageResponse, SpotifyPlaylist, SpotifySearchResult, SpotifyUserProfile } from '#controllers/spotify/spotify.types.js'
import type { FaradayItemData, ScrapedData } from '#controllers/faraday/getItemData.js'

// routers
import faradayRouter from '#controllers/faraday/index.js'
import spotifyRouter from '#controllers/spotify/index.js'
import userRouter from '#controllers/user/index.js'
import { SpotifySearchProjection } from '#middlewares/spotify/getAlbumInfo.js'
import SpotifyApi from '#services/spotify/index.js'
import { JwtPayload } from 'jsonwebtoken'
import { WithId } from 'mongodb'
import { PKCE_RES } from '#middlewares/auth/PKCE/getPCKECredentialsToken.js'


export interface AppState extends Application.DefaultState {
  accessToken?: string | null,
  verifiedToken?: JwtPayload,
  updatedJwtToken?: string,
  playlist?: SpotifyPlaylist,
  playlistInfo?: Record<string, any>,
  currentUser?: WithId<SpotifyUserProfile>,
  spotifyUserToken?:  PKCE_RES,
  data: {
    spotifyTrackInfo?: Array<{tracks: SpotifyAlbumTracksResponse, album: SpotifySearchResult}>,
    spotifyAlbumInfo?: SpotifySearchResult[],
    searchResults?: Array<{
      faraday: FaradayItemData,
      spotify?: SpotifySearchProjection
    }>,
    faraday?: ScrapedData,
    playlistCoverImage?: SpotifyCoverImageResponse,
    userPlaylists?: SpotifyPlaylist[] | null
  },
}
export interface AppContext extends Application.ExtendableContext {
  body: any
  params: Record<string, string>
  state: AppState,
  services: {
    codeVerifier: CodeVerifier;
    mongo: MongoDB;
    token: Token;
    spotify: SpotifyApi,
  }
} 

type AppParamContext = Application.ParameterizedContext<AppState>
// type App = Application<AppState, AppContext>


function createServices(){
  // initialize services
  const services = {
    codeVerifier: new CodeVerifier(),
    mongo: new MongoDB(),
    token: new Token(),
    spotify: new SpotifyApi(),
  }
  return services
}

// Inject dependencies
function createRouter({ services }: { services: AppContext['services'] }){
  const router = new Router<AppState, AppContext>()
  // Add services to the Context
  router.use(
    (async (ctx, next) => {
      console.log('!Initialize data state & add Services -> ');
      ctx.state.data = {}
      ctx.services = services
      console.log('!Services added -> ', Object.keys(ctx.services));
     await next()
    })
  )
  return router
}


const router = createRouter({ 
  services: createServices()
})

// TODO investigate more if this is best way to extend routes.
router.use(faradayRouter.routes(), faradayRouter.allowedMethods())
router.use(spotifyRouter.routes(), spotifyRouter.allowedMethods())
router.use(userRouter.routes(), userRouter.allowedMethods())

// router.get('/api/faraday/playlists', test)

// async function test(ctx: AppParamContext, _next: Application.Next) {
//   ctx.body = { foo: 'bar' }
// }

export default router;
