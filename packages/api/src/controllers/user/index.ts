import Router from 'koa-router';
import mw from '#middlewares/index.js'
import { AppContext, AppState } from "../../router.js";
// env variables
import dotenv from 'dotenv';
import { updateJwtTokenInHeader } from '#middlewares/utils/parseAuthHeader.js';
dotenv.config();

const userRouter = new Router<AppState, AppContext>()


/**
 * We use this route the first time we login to Spotify API
 * Or when changing a user login
 */
userRouter.get("/api/user/verify",
  // use code from url
  mw.auth.getPCKECredentialsToken, 
  // get user info
  mw.spotify.getCurrentUserFromSpotify, 
  // Save the login info & return user info
  async (ctx: AppContext) => {
    try {
      // TODO use mongo info and send _id
      const userInfo = ctx.state.currentUser
      if (!userInfo) throw new Error('No userInfo found from token service')

      // Create JWT token
      const token = ctx.services.token.createJwtToken(userInfo);

      // Update the response Headers
      updateJwtTokenInHeader(ctx, token)

      ctx.set('location', 'http://localhost:5173')
      ctx.body = { userInfo }
      ctx.status = 200
    } catch (error) {
      ctx.throw([500, error])
    }
  }
)

userRouter.get("/api/user",
  mw.auth.refreshTokenMiddleware,
  mw.auth.verifiedTokenMiddleware,
  async (ctx: AppContext) => {
    const verifiedToken = ctx.state.verifiedToken
    try {
      if (typeof verifiedToken === 'string') throw new Error('Typeof verified token does not match')
      if (!verifiedToken) throw new Error('No Verified token')

      // TODO update when we use mongo userinfo with _id
      const user = await ctx.services.mongo.user?.getUserInfoById(verifiedToken.uri)
      ctx.body = {
        userInfo: user
      }
      ctx.status = 200
      console.log('!Headers -> ', ctx.headers);
    } catch (error) {
      ctx.throw([500, error])
    }
  }
)

export default userRouter;