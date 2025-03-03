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
    const playlist = ctx.state.playlist
    // Calling manual route or via MW
    const playlistId = playlist ? playlist.id : ctx.params.playlistId
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
    const userId = ctx.services.token.getUserInfo()?.id
    if (!userId) throw new Error('updateCoverImage No user id was found')
    const updated = await ctx.services.mongo.spotify?.setCoverImage(userId, playlistId, playlistImageInfo)

    console.log('!updated -> ', updated);
    ctx.body = playlistImageInfo
    ctx.status = 200;
  } catch (error) {
    ctx.throw([500, error])
  }
  await next()
}

export async function getPlaylistImage(playlistId: string, accessToken: string ){
  const coverImageURL = `https://api.spotify.com/v1/playlists/${playlistId}/images`
  if (!accessToken) throw new Error('No accessToken found for spotify account')
  const authString = `Bearer ${accessToken}`
  const response = await fetch(coverImageURL, {
    headers: {
      Authorization: authString
    }
  })
  if (!response.ok) throw new Error(`Failed to get image for playlist: ${response.statusText}`)
  const playlistImageInfo: SpotifyCoverImageResponse = await response.json()
  return playlistImageInfo
}

// export async function updatePlaylistImagesById(userId: string,playlistId: string, playlistImageInfo: SpotifyCoverImageResponse){
//   const updated = await ctx.services.mongo.setCoverImage(userId, playlistId, playlistImageInfo)
// }
