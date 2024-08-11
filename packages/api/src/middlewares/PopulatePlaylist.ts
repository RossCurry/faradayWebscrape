import Application from 'koa';
import { ProjectionResultsSingle } from './getAlbumInfo.js';
import { AppContext } from '../router.js';
// import { userToken } from '../router.js';

export default async function PopulatePlaylist(ctx: AppContext, _next: Application.Next) {
  const playlistData =  await ctx.services.mongo.getPlaylistData()
  if (!playlistData.length) throw new Error('No spotify track ids found')
  const playlist = ctx.state.playlist
  const playlistId = playlist?.id
  const playlistEndpoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`
  const body = {
    // example data
    // uris: ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh","spotify:track:1301WleyT98MSxVHPZCA6M", "spotify:episode:512ojhOuo1ktJprKbVcKyQ"],
    // TODO albums dont seem to add
    uris: playlistData,
    position: 0
  }
  const accessToken = ctx.state.accessToken || ctx.state.userToken.get()
  const authString = `Bearer ${accessToken}`
  console.log('!playlistEndpoint -> ', playlistEndpoint);
  console.log('!authString -> ', authString);
  console.log('!body -> ', body);
  try {
    const response = await fetch(playlistEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authString
      },
      body: JSON.stringify(body)
    })
    if (response.ok){
      ctx.body = await response.json()
      ctx.status = 200
      return;
    }
    throw new Error(`Something unknown went wrong adding tracks to playlist ${JSON.stringify(response)}`)
  } catch (error) {
    throw error
  }
}