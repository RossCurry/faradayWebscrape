import Application from "koa"
import jwt from 'jsonwebtoken';
import { AppContext } from "../../router.js"
import { SpotifyUserProfile } from "../../controllers/spotify/spotify.types.js"
import { parseAuthHeaderFromContext } from "#middlewares/utils/parseAuthHeader.js";
import { WithId } from "mongodb";


// get user info
export default async function getCurrentUserFromMongo(ctx: AppContext, next: Application.Next) {
  try {
    const token = ctx.state.verifiedToken;
    if (!token) throw new Error('No JWT token found in request')
    
    const user = await ctx.services.mongo.getUserInfoById(token.uri)
    if (!user) throw new Error('No user found for in DB', { cause: token.uri })
    
    ctx.state.currentUser = user as WithId<SpotifyUserProfile>
    // TODO assert user is SpotifyUserProfile
    ctx.services.token.setUserInfo(user as unknown as SpotifyUserProfile)
    await next()
  } catch (error) {
    throw error
  }
}