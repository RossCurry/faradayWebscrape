import { SortingState } from "@tanstack/react-table"
import {  SpotifyPlaylist, SpotifySearchResult, SpotifyUserProfile } from "../types/spotify.types"
import { getTokenFromAuthorizationHeader } from "../utils/decodeJwt"
import { Filter } from "../types/app.types"

console.log('!import.meta.env -> ', import.meta.env);
// export const baseUrlDev =  import.meta.env.VITE_BASE_URL
export const baseUrlDev =  import.meta.env.PROD ? 'https://api.rosscurry.dev/faraday/api' : 'http://localhost:3000/api/'
console.log('!baseUrlDev -> ', baseUrlDev);

export async function connectToSpoti(){
  const localConnectEndpoint = `${baseUrlDev}spotify/connect`
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
export async function createPlaylist(playlistTitle: string, playlistTracks: SpotifySearchResult["trackList"]) {
  const createPath = 'spotify/playlist/create';
  const token = window.localStorage.getItem('jwt') || ''

  const url = new URL(baseUrlDev + createPath)
  url.searchParams.set('playlistTitle', playlistTitle)
  url.searchParams.set('description', DESCRIPTION)

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
    const jsonRes: { playlist: SpotifyPlaylist } | { error: string} = await response.json()

    if (response.ok) {
      if ('playlist' in jsonRes) return jsonRes.playlist
      return false
    } else {
      return false
    }

  } catch (error) {
    console.error('!Failed fetch to create playlist -> ', error);
  }
}

/**
 * Old route used to get all albums
 */
export async function getAvailableAlbums(){
  const getAlbumsPath = 'faraday/albums'
  const response = await fetch(baseUrlDev + getAlbumsPath)
  if (response.ok){
    const jsonRes: SpotifySearchResult[] = await response.json()
    return jsonRes
  }
}

export type BatchResponse = Awaited<ReturnType<typeof getAlbumsInBatch>>
export async function getAlbumsInBatch({
  offset,
  batchSize,
  cursor,
  sorting,
  filters,
}: {
  offset: number,
  batchSize: number,
  cursor: number,
  sorting?: SortingState,
  filters: Filter
}){

  const getAlbumsPath = 'faraday/albums/batch'
  const url = new URL(baseUrlDev + getAlbumsPath)
  url.searchParams.set('limit', batchSize.toString())
  url.searchParams.set('offset', offset.toString())

  Object.entries(filters).forEach(([filter, value]) => {
    url.searchParams.set(filter, value.toString())
  })

  const response = await fetch(url.toString())
  if (response.ok){
    const jsonRes: {
      data: SpotifySearchResult[],
      totalCount: number
    } = await response.json()

    if (sorting?.length) {
      // TODO implement sorting another request
      // const sort = sorting[0] as ColumnSort
      // const { id, desc } = sort as { id: keyof SpotifySearchResult; desc: boolean }
      // dbData.sort((a, b) => {
      //   if (desc) {
      //     return a[id] < b[id] ? 1 : -1
      //   }
      //   return a[id] > b[id] ? 1 : -1
      // })
    }

    const { data, totalCount } = jsonRes;
    const totalFetched = offset + batchSize
    // TODO improvement: get url from BE
    const nextCursor = cursor + 1

    return {
      data,
      meta: {
        totalCount,
        totalFetched,
        nextCursor,
        prevCursor: Math.max(nextCursor - 1, 0),
      }
    }
  }
  return {
    data: [],
    meta: {}
  }
}

export async function getTrackList(albumId: string) {
  const getTracksPath = `spotify/album/${albumId}/tracks`
  const response = await fetch(baseUrlDev + getTracksPath)
  if (response.ok) {
    const jsonRes = await response.json()
    const { tracklist } = jsonRes;
    return tracklist.items
  }
}


export async function getUserInfoWithToken(token: string) {
  const tokenPath = `user`
  const url = new URL(baseUrlDev + tokenPath)

  try {
    const response = await fetch(url.toString(),{
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })


    if (response.ok) {
      // token will be refreshed on BE
      const authHeader = response.headers.get('Authorization');
      if (authHeader){
        const token = getTokenFromAuthorizationHeader(authHeader)
        window.localStorage.setItem('jwt', token)
      }

      const jsonResponse: { userInfo: SpotifyUserProfile | null } = await response.json()
      return jsonResponse.userInfo
    }

    // Some BE error
    // TODO include FE notification
    const errorResponse = await response.json()
    if (typeof errorResponse === 'object' && 'error' in errorResponse && 'action' in errorResponse){
      const { action } = errorResponse;
      if (action === 'removeJwtToken'){
        window.localStorage.removeItem('jwt')
      }
    }

  } catch (error) {
    console.error('Some error getting the user data', error)
  }

  return null
}

/**
 * Called when redirected from spotify
 * @param code
 * @returns userInfo
 */
export async function getUserInfoWithCode(code: string) {
  const verifyPath = `user/verify`
  const url = new URL(baseUrlDev + verifyPath)
  url.searchParams.set('code', code)

  const response = await fetch(url.toString())

  if (response.ok){
    // token will be refreshed on BE
    const authHeader = response.headers.get('Authorization');
    const jsonResponse: { userInfo: SpotifyUserProfile | null } = await response.json()

    if (authHeader){
      const token = getTokenFromAuthorizationHeader(authHeader)
      window.localStorage.setItem('jwt', token)
    }

    return jsonResponse.userInfo || null
  }

  return null
}

// TODO send user id
export async function getAvailablePlaylists(){
  const getAlbumsPath = 'spotify/playlists'
  const response = await fetch(baseUrlDev + getAlbumsPath)
  if (response.ok){
    const jsonRes: SpotifyPlaylist[] = await response.json()
    return jsonRes
  }
}

// TODO send user id
export async function getTracksByIds(trackIds: string[]){
  const getTracksPath = 'spotify/tracks'
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
