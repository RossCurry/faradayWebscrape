import Application from "koa"
import { AppContext } from "../../router.js"
import { SpotifyUserProfile } from "./spotify.types.js"

// get user info
export default async function getCurrentUser(ctx: AppContext, next: Application.Next) {
  try {
    const accessToken = ctx.services.token.get()
    const authString = `Bearer ${accessToken}`
    const currentUserURL = 'https://api.spotify.com/v1/me'
    const response = await fetch(currentUserURL, {
      headers: {
        Authorization: authString
      }
    })
    const jsonResponse: SpotifyUserProfile = await response.json()
    ctx.services.token.setUserInfo(jsonResponse)
    ctx.services.mongo.setUserInfo(jsonResponse, ctx.services.token.getEndpointInfo())
  } catch (error) {
    throw error
  }
  next()
}