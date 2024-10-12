import { SpotifySearchResult } from "./types/spotify.types"

const localConnectEndpoint = 'http://localhost:3000/api/spotify/connect'
// TODO change endpoint to suit purpose
const localPlaylistEndpoint = 'http://localhost:3000/api/spotify/redirect'
export const baseUrlDev = 'http://localhost:3000'

export async function connectToSpoti(){
  try {
    const response = await fetch(localConnectEndpoint, {
      method: 'GET',
      headers: {
      },
      mode: 'cors',
      credentials: 'include',
    })
    if (response.ok) {
      const locationUrl = response.headers.get('location')
      if (!locationUrl) throw new Error('No location header found in connect route')
      try {
        const url = new URL(locationUrl)
        window.location.href = url.toString()
      } catch (e) {
        console.log('Location URL is not a valid url', e)
      }
    } else {
      const jsonRes = await response.json()
      throw Error(jsonRes)
    }    
  } catch (error) {
    console.log('!Failed fetch to connection route -> ', error);
  }
}

const DESCRIPTION = 'Faraday Collection of what is available on Spotify'
export async function createPlaylist(code: string, playlistTitle: string){
  const url = new URL(localPlaylistEndpoint)
  url.searchParams.set('code', code)
  url.searchParams.set('playlistTitle', playlistTitle)
  url.searchParams.set('description', DESCRIPTION)
  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({}),
      mode: 'cors',
      credentials: 'include',
    })
    const jsonRes = await response.json()
    console.log('!CONFIRM PLAYLIST jsonRes -> ',jsonRes );
    if (response.ok) {
      // TODO confirm playlist creation
    }    
  } catch (error) {
    console.log('!Failed fetch to create playlist -> ', error);
  }
}


export async function getAvailableAlbums(){
  const getAlbumsPath = '/api/faraday/albums'
  const response = await fetch(baseUrlDev + getAlbumsPath)
  if (response.ok){
    const jsonRes: SpotifySearchResult[] = await response.json()
    return jsonRes
    // const sortedOnFE = jsonRes.filter(album => !!album?.name)
    // console.log('getAvailableAlbums: I no longer need sorting',jsonRes.length === sortedOnFE.length, jsonRes.length, sortedOnFE.length) 
    // TODO this should be sorted on the BE
    // setAlbumCollection(sortedOnFE)
  }
}