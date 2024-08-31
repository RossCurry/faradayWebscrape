import Application from 'koa';
import { AppContext } from '../../router.js';

export default async function CreatePlaylist(ctx: AppContext, next: Application.Next) {
  const params = new URLSearchParams(ctx.querystring)
  const playlistTitle = params.get('playlistTitle')
  const description = params.get('description')
  console.log('!CreatePlaylist -> ', playlistTitle);
  const accessToken = ctx.services.token.get()
  const user_id = ctx.services.token.getUserInfo()?.id
  if (!user_id) throw new Error('No user id found for spotify account')
  const url = `https://api.spotify.com/v1/users/${user_id}/playlists`
  const authString = `Bearer ${accessToken}`
  const body = {
    "name": playlistTitle || `Faraday Agosto 2024 - new`,
    "description": description || "FaradayTest",
    "public": true
  }
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        Authorization: authString
      }
    });
    let jsonResponse;
    console.log('!about to parse -> ', response);
    try {
      jsonResponse = await response.json();
    } catch (error) {
      throw error
    }
    // if (!response.ok) throw Error(`something went wrong:  ${JSON.stringify(jsonResponse)}`)
    const spotifyPlaylist = jsonResponse;
    console.log('!spotifyPlaylist -> ', spotifyPlaylist);
    const userUri = ctx.services.token.getUserInfo()?.uri
    if (!userUri) throw new Error('No user uri found for spotify account')
    ctx.services.mongo.setUsersPlaylist(userUri, spotifyPlaylist)
    // return spotifyPlaylist as SpotifyPlaylist
    ctx.state.playlist = spotifyPlaylist
  } catch (error) {
    console.error(error)
    throw error
  }
  next()
}