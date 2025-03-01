import Application, { Next } from 'koa';
import Router from 'koa-router';
import mw from '#middlewares/index.js'
import jwt, { Jwt, JwtPayload } from 'jsonwebtoken';
import { AppContext, AppState } from "../../router.js";
// env variables
import dotenv from 'dotenv';
import { parseAuthHeaderFromContext, updateJwtTokenInHeader } from '#middlewares/utils/parseAuthHeader.js';
import { getErrorResponse } from '#utils/utils.js';
import { SpotifyUserProfile } from '#controllers/spotify/spotify.types.js';
dotenv.config();

const userRouter = new Router<AppState, AppContext>()


userRouter.get("/api/user/verify",
  mw.auth.getPCKECredentialsToken, // use code from url
  mw.spotify.getCurrentUserFromSpotify, // get user info
  async (ctx: AppContext) => {
    try {
      // TODO use mongo info and send _id
      const userInfo = ctx.services.token.getUserInfo();
      console.log('!userInfo -> ', userInfo);
      if (!userInfo) throw new Error('No userInfo found from token service')

      // Create JWT token
      const token = ctx.services.token.createJwtToken(userInfo);
      updateJwtTokenInHeader(ctx, token)

      ctx.body = { userInfo }
      ctx.status = 200
    } catch (error) {
      console.error('!error signin JWT and return userInfo-> ', error);
      ctx.status = 500
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
      const user = await ctx.services.mongo.getUserInfoById(verifiedToken.uri)
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