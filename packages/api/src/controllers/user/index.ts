import Application from 'koa';
import Router from 'koa-router';
import mw from '#middlewares/index.js'
import jwt, { Jwt } from 'jsonwebtoken';
import { AppContext, AppState } from "../../router.js";
// env variables
import dotenv from 'dotenv';
import { parseAuthHeaderFromContext } from '#middlewares/utils/parseAuthHeader.js';
import { getErrorResponse } from '#utils/utils.js';
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
      console.log('!token -> ', token);
      ctx.body = {
        token,
        userInfo
      }
      ctx.status = 200
    } catch (error) {
      console.error('!error signin JWT and return userInfo-> ', error);
      ctx.status = 500
    }
  }
)

userRouter.get("/api/user",
  async (ctx: AppContext) => {
    try {
      const token = parseAuthHeaderFromContext(ctx)
      if (!token) throw new Error('No JWT token found in request')

        // Verify JWT request  token
      const verifiedToken = ctx.services.token.verifyJwtToken(token);
      if (typeof verifiedToken === 'string') throw new Error('Typeof verified token does not match')
      console.log('!verifiedToken -> ', verifiedToken);
      // TODO update when we use mongo userinfo with _id
      const user = await ctx.services.mongo.getUserInfoById(verifiedToken.uri)
      ctx.body = {
        userInfo: user
      }
      ctx.status = 200
    } catch (error) {
      console.error('!error verify JWT -> ', error);
      if (error instanceof Error){
        ctx.body = { error: getErrorResponse(error)}
      }
      ctx.status = 500
    }
  }
)

export default userRouter;