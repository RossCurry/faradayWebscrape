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

type PKCE_ERROR_RES = {
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
    ctx.status = 400
    throw error
  }
  try {
    const token: PKCE_RES | PKCE_ERROR_RES = await getTokenPCKE(code, codeChallenge)
    console.log('!getTokenPCKE response -> ', token);
    if ('error' in token) throw new Error(`Error getting token from Spotify API. Error: ${token.error} message: ${token.error_description}`)
    ctx.services.token.set(token)
    ctx.state.accessToken = token.access_token
    await next()
  } catch (error) {
    ctx.body = { code }
    ctx.status = 500
  }
}
