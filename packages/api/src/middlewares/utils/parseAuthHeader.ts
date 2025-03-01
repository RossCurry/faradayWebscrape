import { AppContext } from "#router/"
import { JwtPayload } from "jsonwebtoken"

export function parseAuthHeaderFromContext(ctx: AppContext){
  // Just return the updatedToken if it exists in the state
  if (ctx.state.updatedToken) return ctx.state.updatedToken;
  console.log('!parseAuthHeaderFromContext -> ');
  const { headers } = ctx
  if (!headers.authorization) throw new Error(`No authorization header found in request: ${ctx.URL.toString()}`)
  const authHeader  = headers.authorization
  const token = authHeader?.split(' ').at(1) || null
  return token
}

export function updateJwtTokenInHeader(ctx: AppContext, newToken: string){
  console.log('!Previous header auth-> ', ctx.headers.authorization);
  console.log('!updateJwtTokenInHeader -> ', newToken);
  ctx.state.updatedToken = newToken;
  ctx.set('Authorization', `Bearer ${newToken}`)
  // Header for FE to update their token
  ctx.set('X-Updated-Jwt', 'true')
}