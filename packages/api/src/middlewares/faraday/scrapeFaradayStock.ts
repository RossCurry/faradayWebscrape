import Application from 'koa'
import getItemData from '#controllers/faraday/getItemData.js'
import { AppContext } from '../../router.js'

/**
 * Adds data.faraday to ctx.state
 */
export default async function scrapeFaradayStock(ctx: AppContext, next: Application.Next) {
  const data = await getItemData()
  ctx.state.data = {
    faraday: data
  }
  next()
}