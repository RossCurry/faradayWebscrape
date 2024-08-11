import Application from 'koa'
import getItemData from '#controllers/faraday/getItemData.js'
import { AppContext, AppState } from '../router.js'

/**
 * Adds data.faraday to ctx.state
 */
export default async function getFaradayStock(ctx: AppContext, next: Application.Next) {
  console.log('!getFaradayStock -> ');
  try {
    const { mongo } = ctx.services
    if (!mongo) throw new Error('No mongo object found')
    const faradayData = await mongo.getFaradayData()
    ctx.state.data.faraday = faradayData
  } catch (error) {
    console.error('Error in middleware:', error);
    ctx.status = 500;
    ctx.body = 'Internal Server Error';
  }
  next()
}