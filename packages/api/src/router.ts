import Application from 'koa'
import Router from "koa-router"
// services
import MongoDB from '#services/mongodb/index.js'
import CodeVerifier from '#services/codeVerifier/CodeVerifier.js'
import Token from '#services/token/Token.js'
// controllers
import { SpotifyAlbumTracksResponse, SpotifyPlaylist } from '#controllers/spotify/spotify.types.js'
import { FaradayItemData } from '#controllers/faraday/getItemData.js'
// middlewares
import mw from '#middlewares/index.js'
// types
import type { SpotifySearchResult } from '#middlewares/spotify/getAlbumInfo.js'


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


// initialize services
router.use(
  (async (ctx, next) => {
    console.log('!initialize services -> ');
    ctx.state.data = {}
    ctx.services = services
   await next()
  })
)





async function test(ctx: AppParamContext, _next: Application.Next) {
  ctx.body = { foo: 'bar' }
}

export default router;
