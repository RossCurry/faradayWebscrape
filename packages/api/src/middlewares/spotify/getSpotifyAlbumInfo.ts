import Application from 'koa'
import getItemData from '#controllers/faraday/getItemData.js'
import { AppContext, AppState } from '../../router.js'

/**
 * Adds data.faraday to ctx.state
 */
export default async function getSpotifyAlbumInfo(ctx: AppContext, next: Application.Next) {
  console.log('!setSpotifyAlbumInfo -> ');
  try {
    const { mongo } = ctx.services
    if (!mongo) throw new Error('No mongo object found')
    const spotifyAlbums = await mongo.getSpotifyData({ 'spotify.trackIds' : { '$exists': false }})
    ctx.state.data.spotifyAlbumInfo = spotifyAlbums
  } catch (error) {
    console.error('Error in middleware:', error);
    ctx.status = 500;
    ctx.body = 'Internal Server Error';
  }
  await next()
}