import Application from 'koa'
import Router from "koa-router"

// services
import MongoDB from '#services/mongodb/index.js'
import CodeVerifier from '#services/codeVerifier/CodeVerifier.js'
import Token from '#services/token/Token.js'

// types
import type { SpotifyAlbumTracksResponse, SpotifyCoverImageResponse, SpotifyPlaylist, SpotifySearchResult } from '#controllers/spotify/spotify.types.js'
import type { FaradayItemData, ScrapedData } from '#controllers/faraday/getItemData.js'

// routers
import faradayRouter from '#controllers/faraday/index.js'
import spotifyRouter from '#controllers/spotify/index.js'
import { SpotifySearchProjection } from '#middlewares/spotify/getAlbumInfo.js'


export interface AppState extends Application.DefaultState {
  accessToken?: string | null,
  playlist?: SpotifyPlaylist,
  playlistInfo?: Record<string, any>,
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
export interface AppContext extends Application.BaseContext {
  params: Record<string, string>
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


// initialize services
router.use(
  (async (ctx, next) => {
    console.log('!initialize services -> ');
    ctx.state.data = {}
    ctx.services = services
   await next()
  })
)

// TODO investigate more if this is best way to extend routes.
router.use(faradayRouter.routes(), faradayRouter.allowedMethods())
router.use(spotifyRouter.routes(), spotifyRouter.allowedMethods())

// router.get('/api/faraday/playlists', test)

// async function test(ctx: AppParamContext, _next: Application.Next) {
//   ctx.body = { foo: 'bar' }
// }

export default router;
