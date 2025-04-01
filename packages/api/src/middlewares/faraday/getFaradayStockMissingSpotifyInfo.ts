import Application from 'koa'
import { AppContext } from '../../router.js'

/**
 * Adds data.faraday to ctx.state
 */
export default async function getFaradayStockMissingSpotifyInfo(ctx: AppContext, next: Application.Next) {
  console.log('!getFaradayStock -> ');
  try {
    const { mongo } = ctx.services
    if (!mongo) throw new Error('No mongo object found')
    
    const BATCH_LIMIT = 50
    // Best to do this in BATCHES - only return 10 
    const faradayData = await mongo.faraday?.getFaradayDataMissingSpotifyInfo(BATCH_LIMIT)
    if (!faradayData) throw new Error('No faradayData found')
    
    // Assuming data in the DB is clean 😅
    ctx.state.data.faraday = { cleanItems: faradayData }
    await next()
  } catch (error) {
    ctx.throw([500, error])
  }
}