import Application from 'koa';
import { ProjectionResultsSingle } from './getAlbumInfo.js';
import { AppContext } from '../../router.js';
import { getBatches } from '#utils/utils.js';

type SnapshotResponse = {
  snapshot_id: string
}

export default async function PopulatePlaylist(ctx: AppContext, next: Application.Next) {
  // const playlistData =  await ctx.services.mongo.getPlaylistData()
  // if (!playlistData.length) throw new Error('No spotify track ids found')
  console.log('!PopulatePlaylist ctx.body -> ', ctx.request.body);
  let playlistTracks;
  if (ctx.request.body){ 
    playlistTracks = (ctx.request.body as Record<string, any>).playlistTracks
  }
  console.log('!playlistTracks -> ', playlistTracks);
  if (!playlistTracks || !playlistTracks.length) throw new Error('No spotify track ids found')
  
  console.log('!PopulatePlaylist token.getUserInfo() -> ', ctx.services.token.getUserInfo()); 
  const accessToken = (ctx.services.token.getUserInfo() as any)?.endpoint.access_token
  if (!accessToken) throw new Error('No accessToken')

  const playlist = ctx.state.playlist
  const playlistId = playlist?.id
  const playlistEndpoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`
  // TODO 100 max uris per request
  let batches = [playlistTracks]
  if (playlistTracks.length > 100){
    batches = getBatches(playlistTracks, 100)
  }
  console.log('!batches.length -> ', batches.length);
  // TODO this needs to be sequential
  const snapshots: SnapshotResponse[] = []
    for await (const [i, uriBatch] of batches.entries()){

      const body = {
        // example data
        // uris: ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh","spotify:track:1301WleyT98MSxVHPZCA6M", "spotify:episode:512ojhOuo1ktJprKbVcKyQ"],
        // TODO albums dont seem to add
        uris: uriBatch,
        position: i === 0 ? 0 : i * 100
      }
      // TODO re-write this
      // const accessToken = ctx.state.accessToken || ctx.state.userToken?.get() || (ctx.services.token.getUserInfo() as any)?.endpoint?.access_token
      
      const authString = `Bearer ${accessToken}`
      console.log('!playlistEndpoint -> ', playlistEndpoint);
      console.log('!authString -> ', authString);
      console.log('!uriBatch -> ', uriBatch.length);
      // console.log('!position -> ', body.position);
      // console.log('!JSON.stringif(body) -> ', JSON.stringify(body));
      try {
        const response = await fetch(playlistEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authString
          },
          body: JSON.stringify(body)
        })
        let responseBody = await response.json()
        const snapshot: SnapshotResponse = responseBody
        snapshots.push(snapshot)
      } catch (error) {
        ctx.body = error
        ctx.status = 500
        throw error
      }
    }
  try {
    if (playlist && 'error' in playlist){
      throw new Error(JSON.stringify((playlist as { error: { message: string, status: number } }).error))
    }
    ctx.body = JSON.stringify({playlist})
    ctx.status = 200
  } catch (error: unknown) {
    console.error(error);
    ctx.body = error
    ctx.status = (error as { message: string, status: number }).status || 500
  }
  await next()
}