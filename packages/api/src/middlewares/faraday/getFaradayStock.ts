import Application from 'koa'
import { AppContext } from '../../router.js'

/**
 * Adds data.faraday to ctx.state
 */
export default async function getFaradayStock(ctx: AppContext, next: Application.Next) {
  console.log('!getFaradayStock -> ');
  try {
    const { mongo } = ctx.services
    if (!mongo) throw new Error('No mongo object found')

    const faradayData = await mongo.faraday?.getFaradayData()
    if (!faradayData) throw new Error('No faradayData found')
    
    ctx.state.data.faraday = { cleanItems: faradayData }
    await next()
  } catch (error) {
    ctx.throw([500, error])
  }
}