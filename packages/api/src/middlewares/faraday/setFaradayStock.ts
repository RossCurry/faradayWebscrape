import Application from 'koa'
import { AppContext } from '../../router.js'

/**
 * Adds data.faraday to ctx.state
 */
export default async function setFaradayStock(ctx: AppContext, next: Application.Next) {
  try {
    const { faraday } = ctx.state.data
    if (!faraday) throw new Error('No faraday data found')

    const { mongo } = ctx.services
    if (!mongo) throw new Error('No mongo object found')
    
    const inserted = await mongo.faraday?.setFaradayData(faraday.cleanItems)
    ctx.body = JSON.stringify(inserted)
    ctx.status = 200
  } catch (error) {
    ctx.throw([500, error])
  }
  await next()
}