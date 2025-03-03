import Application from "koa"
import { AppContext } from "../../router.js"
import { WithId } from "mongodb"
import { SpotifyUserProfile } from "#controllers/spotify/spotify.types.js"

// get user info
export default async function getCurrentUserFromSpotify(ctx: AppContext, next: Application.Next) {
  try {
    // const accessToken = ctx.services.token.get()
    const accessToken = ctx.state.accessToken
    if (!accessToken) throw new Error('No access token found')
      
    const spotfiyUserToken = ctx.state.spotifyUserToken  
    if (!spotfiyUserToken) throw new Error('No spotfiyUserToken token found')
    
    // Get user info
    const userInfo = await ctx.services.spotify.getUserInfo(accessToken);
    
    const savedInfo = await ctx.services.mongo.user?.setUserInfo(userInfo, spotfiyUserToken)
    if (!savedInfo) throw new Error('User info was not saved correctly in the DB')

    ctx.state.currentUser = savedInfo
  } catch (error) {
    throw error
  }
  await next()
}