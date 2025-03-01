import { AppContext } from "#router/"

export function parseAuthHeaderFromContext(ctx: AppContext){
  // Just return the updatedToken if it exists in the state
  if (ctx.state.updatedJwtToken) return ctx.state.updatedJwtToken;
  const { headers } = ctx
  if (!headers.authorization) throw new Error(`No authorization header found in request: ${ctx.URL.toString()}`)
  const authHeader  = headers.authorization
  const token = authHeader?.split(' ').at(1) || null
  return token
}

export function updateJwtTokenInHeader(ctx: AppContext, newToken: string){
  // UpdateToken for current request
  ctx.state.updatedJwtToken = newToken;
  // UpdateToken in Header for FE in response
  ctx.set('Authorization', `Bearer ${newToken}`)
  ctx.set('X-Updated-Jwt', 'true')
}