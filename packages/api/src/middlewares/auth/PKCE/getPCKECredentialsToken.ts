import Application from "koa"
import { AppContext } from "../../../router.js"
import { getTokenPCKE } from "#controllers/spotify/auth/PKCE/2.requestUserAuth.js"

export type PKCE_RES = {
  access_token: string,
  token_type: 'Bearer',
  expires_in: number, // 3600
  refresh_token: string,
  scope: string
}

export type PKCE_ERROR_RES = {
  error: string, // 'invalid_grant',
  error_description: string //'Invalid authorization code'
}

export default async function getPCKECredentialsToken(ctx: AppContext, next: Application.Next) {
  const params = new URLSearchParams(ctx.querystring)
  const code = params.get('code')
  const codeChallenge = ctx.services.codeVerifier.get()
  
  try {
    if (!code || !codeChallenge) throw new Error(`Missing code or codeChallenge from request: ${ctx.URL.toString()}`)
  } catch (error) {
    ctx.throw([400, error])
  }

  try {
    // Get user token info from spotify
    const token: PKCE_RES = await ctx.services.spotify.getTokenPCKE(code, codeChallenge)

    // Set access token info in request state
    ctx.state.accessToken = token.access_token
    ctx.state.spotifyUserToken = token
  } catch (error) {
    ctx.throw([500, error])
  }
  await next()
}
