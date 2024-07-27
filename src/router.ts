import Application from 'koa'
import Router from "koa-router"
import { getTokenMw } from "./spotify/middlewares/auth.js"
import { getCurrentUser } from './spotify/users/users.js'
import getFaradayStock from './spotify/middlewares/getFaradayStock.js'
import getAlbumInfo from './spotify/middlewares/getAlbumInfo.js'
import writeToDisk from './spotify/middlewares/writeToDisk.js'
const router = new Router()

// Test
// router.get("/", (ctx, next) => {
//   ctx.body = "hello"
// })

router.get("/",
  getTokenMw,
  // getCurrentUser,
  getFaradayStock,
  getAlbumInfo,
  writeToDisk,
  // CreatePlaylist,
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
