import Application from 'koa'
import Router from "koa-router"
import { getTokenMw } from "./spotify/middlewares/auth.js"
import { getCurrentUser } from './spotify/users/users.js'
import getFaradayStock from './spotify/middlewares/getFaradayStock.js'
import getAlbumInfo from './spotify/middlewares/getAlbumInfo.js'
import writeToDisk from './spotify/middlewares/writeToDisk.js'
import CreatePlaylist from './spotify/middlewares/CreatePlaylist.js'
import { getToken } from './spotify/auth/PKCE/2.requestUserAuth.js'
import { redirectToSpotifyAuthorize } from './spotify/auth/PKCE/1.codeChallenge.js'
const router = new Router()


/**
 * request from UI to send code verification to spoti auth
 */
router.get('/connect', async (ctx: Application.ParameterizedContext, _next: Application.Next) => {
  const spotifyAuthUrl = await redirectToSpotifyAuthorize()
  console.log('!spotifyAuthUrl -> ', spotifyAuthUrl);
  ctx.set('Content-Type', 'application/json');
  ctx.set('location', spotifyAuthUrl);
  ctx.status = 201 // created
})

// Test
router.get("/redirect", async (ctx: Application.ParameterizedContext, _next: Application.Next) => {
  const params = new URLSearchParams(ctx.querystring)
  const code = params.get('code')
  try {
    const token = await getToken(code || '')
    ctx.body = {code, token}
  } catch (error) {
    ctx.body = {code} 
  }

})
router.get("/callback", (ctx: Application.ParameterizedContext, _next: Application.Next) => {
  const params = new URLSearchParams(ctx.querystring)
  
  ctx.body = "hello callback"
})

router.get("/",
  getTokenMw,
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

export default router;
