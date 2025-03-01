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


const refreshTokenMiddleware = async (ctx: AppContext, next: Next) => {
  // Get request token
  let token: string | null = null;
  try {
    // Extract token from header
    token = parseAuthHeaderFromContext(ctx)
    if (!token) throw new Error('No JWT token found in request')
  } catch (error) {
    if (error instanceof Error){
      ctx.body = { error: getErrorResponse(error)}
    }
    ctx.status = 400;
    return
  }


  // Check if token is expired or close to it
  const isExpired = ctx.services.token.isJwtTokenExpired(token); 
  if (isExpired) {
    try {
      const decoded = jwt.decode(token, { complete: true });
      console.log('!decoded -> ', decoded);
      if (!decoded || !('payload' in decoded) || typeof decoded.payload === 'string') throw new Error('Token error. unable to decode token')
      const userInfo = decoded.payload as SpotifyUserProfile;
      const refreshToken = await ctx.services.mongo.getUsersRefreshToken(userInfo);
      if (!refreshToken) throw new Error('No refresh token found for user: ', { cause: userInfo.display_name })
      const newAccessTokenInfo = await ctx.services.spotify.refreshToken(refreshToken); // Function to refresh token
      console.log('!newAccessTokenInfo from Spotify-> ', newAccessTokenInfo);
      // Update user endpointInfo in DB
      await ctx.services.mongo.setUserInfo(userInfo, newAccessTokenInfo)

      // CreateNewJWT token
      const newJwtToken = ctx.services.token.createJwtToken(userInfo)
      updateJwtTokenInHeader(ctx, newJwtToken)
    } catch (error) {
      ctx.throw([500, error])
    }
  } 
  // let downstream handlers deal with unauthorized access
  await next();
};

const verifiedTokenMiddleware = async (ctx: AppContext, next: Next) => {
  // Should exist because of refreshToken MW
  const token = parseAuthHeaderFromContext(ctx);
  console.log('!verifiedTokenMiddleware parseAuthHeaderFromContext token -> ', token);
  // Verify JWT request  token
  let verifiedToken: JwtPayload | string | undefined;
  try {
    verifiedToken = ctx.services.token.verifyJwtToken(token as string); 
    console.log('!verifiedToken -> ', verifiedToken);
  } catch (error) {
    ctx.throw([401, error])
  }
  // Pass verified token to the state
  ctx.state.verifiedToken = verifiedToken;
  await next()
}

userRouter.get("/api/user",
  refreshTokenMiddleware,
  verifiedTokenMiddleware,
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
    } catch (error) {
      ctx.throw([500, error])
      // if (error instanceof Error){
      //   ctx.body = { error: getErrorResponse(error)}
      // }
      // ctx.status = 500
    }
  }
)

export default userRouter;