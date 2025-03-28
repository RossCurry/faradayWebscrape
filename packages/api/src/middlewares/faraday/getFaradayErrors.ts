import Application from 'koa'
import { AppContext } from '../../router.js'

/**
 * Adds data.faraday to ctx.state
 */
export default async function getFaradayErrors(ctx: AppContext, next: Application.Next) {
  try {
    const { mongo } = ctx.services
    if (!mongo) throw new Error('No mongo object found')
    
    const errors = await mongo.faraday?.getFaradayErrors()

    ctx.body = JSON.stringify(errors)
    ctx.status = 200
  } catch (error) {
    ctx.throw([500, error])
  }
  await next()
}