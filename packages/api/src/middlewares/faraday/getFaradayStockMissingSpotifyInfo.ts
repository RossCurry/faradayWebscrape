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
    const faradayData = await mongo.getFaradayDataMissingSpotifyInfo()
    // Assuming data in the DB is clean 😅
    ctx.state.data.faraday = { cleanItems: faradayData }
  } catch (error) {
    console.error('Error in middleware:', error);
    ctx.status = 500;
    ctx.body = 'Internal Server Error';
  }
  next()
}