import Application from 'koa';
import { AppContext } from '../router.js';

export default async function CreatePlaylist(ctx: AppContext, next: Application.Next) {
  const accessToken = ctx.state.accessToken || ctx.state.userToken.get()
  const user_id = 'freezealicious'
  const url = `https://api.spotify.com/v1/users/${user_id}/playlists`
  const authString = `Bearer ${accessToken}`
  const body = {
    "name": "FaradayTest4",
    "description": "FaradayTest",
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
    if (!response.ok) throw Error(`something went wrong:  ${(await response.json().then(obj => console.log("obj", obj)))}`)

    const spotifyPlaylist = await response.json();
    console.log('!spotifyPlaylist -> ', spotifyPlaylist);
    // return spotifyPlaylist as SpotifyPlaylist
    ctx.state.playlist = spotifyPlaylist
  } catch (error) {
    console.error(error)
    throw error
  }
  next()
}