import { SpotifyUserProfile } from "#controllers/spotify/spotify.types.js";
import { parseAuthHeaderFromContext, updateJwtTokenInHeader } from "#middlewares/utils/parseAuthHeader.js";
import { AppContext } from "#router/";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Next } from "koa";

export const refreshTokenMiddleware = async (ctx: AppContext, next: Next) => {
  let token: string | null = null;
  try {
    // Extract token from header
    token = parseAuthHeaderFromContext(ctx)
    if (!token) throw new Error('No JWT token found in request')
  } catch (error) {
    ctx.throw([400, error])
  }

  // Check if token is expired or close to it
  const isExpired = ctx.services.token.isJwtTokenExpired(token); 
  if (isExpired) {
    try {
      const decoded = ctx.services.token.decodeJwtToken(token)
      if (!decoded || !('payload' in decoded) || typeof decoded.payload === 'string') throw new Error('Token error. unable to decode token')

      const userInfo = decoded.payload as SpotifyUserProfile;
      const refreshToken = await ctx.services.mongo.getUsersRefreshToken(userInfo);
      if (!refreshToken) throw new Error('No refresh token found for user: ', { cause: userInfo.display_name })
      
      // Refresh token in Spotify
      const newAccessTokenInfo = await ctx.services.spotify.refreshToken(refreshToken); 
      
      // Update user endpointInfo in DB
      await ctx.services.mongo.setUserInfo(userInfo, newAccessTokenInfo)

      // CreateNewJWT token
      const newJwtToken = ctx.services.token.createJwtToken(userInfo)
      
      // Update ctx.state and response headers
      updateJwtTokenInHeader(ctx, newJwtToken)
    } catch (error) {
      ctx.throw([500, error])
    }
  } 
  // let downstream handlers deal with unauthorized access
  await next();
};

export const verifiedTokenMiddleware = async (ctx: AppContext, next: Next) => {
  // Should exist because of refreshToken MW
  const token = parseAuthHeaderFromContext(ctx);
  
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