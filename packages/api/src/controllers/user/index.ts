import Application from 'koa';
import Router from 'koa-router';
import mw from '#middlewares/index.js'
import jwt, { Jwt } from 'jsonwebtoken';
import { AppContext, AppState } from "../../router.js";
// env variables
import dotenv from 'dotenv';
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
      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) throw new Error('No ENV vars found for secret')
      console.log('!JWT_SECRET -> ', JWT_SECRET);
      // Create JWT token
      const token = jwt.sign(userInfo, JWT_SECRET, { expiresIn: '1h' });
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
  // mw.spotify.getCurrentUserFromDB, // get user info
  async (ctx: AppContext) => {
    try {
      const params = new URLSearchParams(ctx.querystring)
      const token = params.get('token')
      if (!token) throw new Error('No JWT token found in request')
      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) throw new Error('No ENV vars found for secret')
      console.log('!JWT_SECRET -> ', JWT_SECRET);
      // Create JWT token
      const verifiedToken = jwt.verify(token, JWT_SECRET);
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
      ctx.status = 500
    }
  }
)

export default userRouter;