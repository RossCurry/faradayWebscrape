import Application from 'koa';
import { AppContext } from '../../router.js';


function isNonEmptyString(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function assertPlaylistParams({
  accessToken, 
  userId, 
  playlistTitle, 
  description
}: {
  accessToken: string | null, 
  userId: string, 
  playlistTitle: string | null, 
  description: string | null,
}){
  if (!isNonEmptyString(accessToken)) throw new Error('No accessToken found for spotify account')
  if (!isNonEmptyString(userId)) throw new Error('No user id found for spotify account')
  if (!isNonEmptyString(playlistTitle)) throw new Error('No playlistTitle found for create playlist')
  if (!isNonEmptyString(description)) throw new Error('No description found for create playlist')
  return  {
    accessToken, 
    userId, 
    playlistTitle, 
    description
  }
}

export default async function CreatePlaylist(ctx: AppContext, next: Application.Next) {
  const params = new URLSearchParams(ctx.querystring)
  const playlistTitle = params.get('playlistTitle')
  const description = params.get('description')
  
  const currentUser = ctx.state.currentUser;
  if (!currentUser) throw new Error('No currentUser found in request')

  try {    
    const accessToken = await ctx.services.mongo.user?.getUsersAccessToken(currentUser);
    if (!accessToken) throw new Error('No user access token found');

    const playlistParams = { 
      accessToken,
      description,
      playlistTitle,
      userId: currentUser.id,
    }

    // Assert all params. 
    const createdPlaylist = await ctx.services.spotify.createPlaylist(assertPlaylistParams(playlistParams))

    console.log('!spotifyPlaylist -> ', createdPlaylist);
    
    const userUri = currentUser.uri
    await ctx.services.mongo.user?.setUsersPlaylist(userUri, createdPlaylist)

    // Add to request state
    ctx.state.playlist = createdPlaylist
  } catch (error) {
    console.error(error)
    throw error
  }
  await next()
}