import Application from 'koa';
import { ProjectionResultsSingle } from './getAlbumInfo.js';
import { AppContext } from '../../router.js';
import { getBatches } from '#utils/utils.js';

type SnapshotResponse = {
  snapshot_id: string
}

export default async function PopulatePlaylist(ctx: AppContext, _next: Application.Next) {
  const playlistData =  await ctx.services.mongo.getPlaylistData()
  if (!playlistData.length) throw new Error('No spotify track ids found')
  const playlist = ctx.state.playlist
  const playlistId = playlist?.id
  const playlistEndpoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`
  // TODO 100 max uris per request
  let batches = [playlistData]
  if (playlistData.length > 100){
    batches = getBatches(playlistData, 100)
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
      const accessToken = ctx.state.accessToken || ctx.state.userToken.get()
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
    ctx.body = JSON.stringify(snapshots)
    ctx.status = 200
}