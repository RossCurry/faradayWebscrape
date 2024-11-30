import Application from "koa"
import jwt from 'jsonwebtoken';
import { AppContext } from "../../router.js"
import { SpotifyUserProfile } from "../../controllers/spotify/spotify.types.js"

// get user info
export default async function getCurrentUserFromMongo(ctx: AppContext, next: Application.Next) {
  try {
    console.log('!getCurrentUserFromMongo -> ');
    const params = new URLSearchParams(ctx.querystring)
    
    const token = params.get('token')
    if (!token) throw new Error('No JWT token found in request')
    
      const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) throw new Error('No ENV vars found for secret')
    
      const verifiedToken = jwt.verify(token, JWT_SECRET);
    if (typeof verifiedToken === 'string') throw new Error('Typeof verified token does not match')
    console.log('!verifiedToken -> ', verifiedToken);
    const user = await ctx.services.mongo.getUserInfoById(verifiedToken.uri)
    if (!user) throw new Error('No user found for in DB')
    
    console.log('!setting user info -> ', user);
    // TODO assert user is SpotifyUserProfile
    ctx.services.token.setUserInfo(user as unknown as SpotifyUserProfile)
    console.log('!confirm user info -> ', ctx.services.token.getUserInfo());
    await next()
  } catch (error) {
    throw error
  }
}