import { AppContext } from "#router/"

export function parseAuthHeaderFromContext(ctx: AppContext){
  const { headers } = ctx
  if (!headers.authorization) throw new Error(`No authorization header found in request: ${ctx.URL.toString()}`)
  const authHeader  = headers.authorization
  const token = authHeader?.split(' ').at(1) || null
  return token
}
