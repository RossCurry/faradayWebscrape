import Application from 'koa'
import getItemData from '#controllers/faraday/getItemData.js'
import { AppContext } from '../../router.js'
import { scrapeThisIsFaraday } from '#controllers/faraday/scrapeThisIsFaraday.js'

/**
 * Adds data.faraday to ctx.state
 */
export default async function scrapeFaradayStock(ctx: AppContext, next: Application.Next) {
  // const data = await getItemData()
  const data = await scrapeThisIsFaraday()
  ctx.state.data = {
    faraday: { cleanItems: data.itemsData, errorItems: []}
  }
  ctx.status = 200
  await next()
}