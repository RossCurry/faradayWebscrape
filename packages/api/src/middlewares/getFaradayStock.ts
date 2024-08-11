import Application from 'koa'
import getItemData from '#controllers/faraday/getItemData.js'

export default async function getFaradayStock(ctx: Application.ParameterizedContext, next: Application.Next) {
  const data = await getItemData()
  ctx.state.data = {
    faraday: data
  }
  next()
}