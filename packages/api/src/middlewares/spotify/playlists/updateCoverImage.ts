import Application from 'koa'
import getItemData from '#controllers/faraday/getItemData.js'
import { AppContext } from '#router/';
import { SpotifyCoverImageResponse } from '#controllers/spotify/spotify.types.js';
import { user } from '../../../constants.js';

/**
 * Gets cover image for a playlist
 */
export default async function updateCoverImage(ctx: AppContext, next: Application.Next) {
  console.log('!setSpotifyTrackInfo -> ');
  try {
    const { playlistId } = ctx.params
    const coverImageURL = `https://api.spotify.com/v1/playlists/${playlistId}/images`
    const accessToken = ctx.services.token.get()
    if (!accessToken) throw new Error('No accessToken found for spotify account')
    const authString = `Bearer ${accessToken}`
    const response = await fetch(coverImageURL, {
      headers: {
        Authorization: authString
      }
    })
    if (!response.ok) throw new Error(`Failed to get image for playlist: ${response.statusText}`)
    const playlistImageInfo: SpotifyCoverImageResponse = await response.json()
    // TODO use dynamic userId
    const userId = user.freezeId
    if (!userId) throw new Error('updateCoverImage No user id was found')
    const updated = await ctx.services.mongo.setCoverImage(userId, playlistId, playlistImageInfo)
    console.log('!updated -> ', updated);
    ctx.body = playlistImageInfo
    ctx.status = 200;
    next()
  } catch (error) {
    console.error('Error in middleware:', error);
    ctx.status = 500;
    ctx.body = `Internal Server Error: ${error}`;
  }
}