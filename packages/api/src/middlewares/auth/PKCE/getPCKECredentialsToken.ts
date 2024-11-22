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

export default async function getPCKECredentialsToken(ctx: AppContext, next: Application.Next) {
  const params = new URLSearchParams(ctx.querystring)
  const code = params.get('code')
  const codeChallenge = ctx.services.codeVerifier.get()
  if (!code || !codeChallenge) throw new Error('Missing code or codeChallenge from redirect')
  try {
    const token: PKCE_RES = await getTokenPCKE(code, codeChallenge)
    console.log('!getTokenPCKE response -> ', token);
    ctx.services.token.set(token)
    ctx.state.accessToken = token.access_token
    await next()
  } catch (error) {
    ctx.body = { code }
  }
}
