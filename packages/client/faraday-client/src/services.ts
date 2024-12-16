import {  SpotifyPlaylist, SpotifySearchResult, SpotifyUserProfile } from "./types/spotify.types"

const localConnectEndpoint = 'http://localhost:3000/api/spotify/connect'
// TODO change endpoint to suit purpose

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

// TODO create playlist using selected options
const DESCRIPTION = 'Faraday Collection of what is available on Spotify'
export async function createPlaylist(playlistTitle: string, playlistTracks: SpotifySearchResult["trackList"]) {
  const createPath = '/api/spotify/playlist/create';
  const token = window.localStorage.getItem('jwt') || ''
  const url = new URL(baseUrlDev + createPath)
  url.searchParams.set('playlistTitle', playlistTitle)
  url.searchParams.set('description', DESCRIPTION)
  console.log('!FE createPlaylist -> ', playlistTracks);
  const trackUris = playlistTracks.map(track => track.uri)
  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        playlistTracks: trackUris
      }),
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

export async function getTrackList(albumId: string) {
  const getTracksPath = `/api/spotify/album/${albumId}/tracks`
  const response = await fetch(baseUrlDev + getTracksPath)
  if (response.ok) {
    const jsonRes = await response.json()
    console.log('!jsonRes -> ', jsonRes);
    const { tracklist } = jsonRes;
    return tracklist.items
  }
}


export async function getUserInfoWithToken(token: string) {
  const tokenPath = `/api/user`
  const url = new URL(baseUrlDev + tokenPath)

  console.log('!getUserInfoWithToken -> ', token);
  const response = await fetch(url.toString(),{
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (response.ok) {
    // Handling token expiration on the BE
    const jsonRes: { userInfo: SpotifyUserProfile | null, token: string } = await response.json()
    if (jsonRes.token) {
      window.localStorage.setItem('jwt', jsonRes.token)
    }
    return jsonRes.userInfo || null
  }

  return null
}


export async function getUserInfoWithCode(code: string) {
  console.log('!getUserInfo -> ', !!code);
  const verifyPath = `/api/user/verify`
  const url = new URL(baseUrlDev + verifyPath)
  console.log('!url.toString() -> ', url.toString());
  url.searchParams.set('code', code)

  const response = await fetch(url.toString())

  if (response.ok){
    // Handling token expiration on the BE
    const jsonRes: { userInfo: SpotifyUserProfile | null, token: string } = await response.json()
    if (jsonRes.token) {
      window.localStorage.setItem('jwt', jsonRes.token)
    }
    return jsonRes.userInfo || null 
  }

  return null
}

// TODO send user id
export async function getAvailablePlaylists(){
  const getAlbumsPath = '/api/spotify/playlists'
  const response = await fetch(baseUrlDev + getAlbumsPath)
  if (response.ok){
    const jsonRes: SpotifyPlaylist[] = await response.json()
    return jsonRes
  }
}

// TODO send user id
export async function getTracksByIds(trackIds: string[]){
  const getTracksPath = '/api/spotify/tracks'
  const response = await fetch(baseUrlDev + getTracksPath, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ trackIds })
  })
  if (response.ok){
    const jsonRes: SpotifySearchResult["trackList"] = await response.json()
    return jsonRes
  }
}
