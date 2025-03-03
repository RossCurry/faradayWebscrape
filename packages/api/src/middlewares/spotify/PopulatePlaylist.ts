import { AppContext } from '../../router.js';


export default async function PopulatePlaylist(ctx: AppContext) {
  let playlistTracks;
  if (ctx.request.body){ 
    playlistTracks = (ctx.request.body as Record<string, any>).playlistTracks
  }
  if (!playlistTracks || !playlistTracks.length) throw new Error('No spotify track ids found')
  
  const currentUser = ctx.state.currentUser;
  if (!currentUser) throw new Error('No currentUser found in request')

  const accessToken = await ctx.services.mongo.user?.getUsersAccessToken(currentUser)
  if (!accessToken) throw new Error('No accessToken')
    
  const playlist = ctx.state.playlist
  if (!playlist) throw new Error('No playlist information')
  const playlistId = playlist.id


  try {
    await ctx.services.spotify.populatePlaylist({
      accessToken, 
      playlistId, 
      playlistTracks
    })
    ctx.body = JSON.stringify({playlist})
    ctx.status = 200
  } catch (error: unknown) {
    ctx.throw([500, error])
  }
}