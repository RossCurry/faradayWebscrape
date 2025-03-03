import Application from 'koa'
import getItemData from '#controllers/faraday/getItemData.js'
import { AppContext, AppState } from '../../router.js'

/**
 * Adds data.faraday to ctx.state
 */
export default async function setSpotifyAlbumInfo(ctx: AppContext, next: Application.Next) {
  console.log('!setSpotifyAlbumInfo -> ');
  try {
    const { searchResults } = ctx.state.data
    console.log('!Spotify searchResults -> ', searchResults?.length);
    if (!searchResults) throw new Error('No faraday data found')
      
    const { mongo } = ctx.services
    if (!mongo) throw new Error('No mongo object found')

    const faradayData = await mongo.faraday?.getFaradayData()
    if (!faradayData) throw new Error('No mongo object found')

    const inserted = await mongo.spotify?.setSpotifyData(searchResults, faradayData)
    ctx.body = JSON.stringify(inserted)
    ctx.status = 200
  } catch (error) {
    console.error('Error in middleware:', error);
    ctx.status = 500;
    ctx.body = 'Internal Server Error';
  }
  await next()
}