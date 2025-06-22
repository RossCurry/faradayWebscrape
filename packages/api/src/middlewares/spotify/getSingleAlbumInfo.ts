import { SpotifyAlbum } from "#controllers/spotify/spotify.types.js";

/**
 * Uses album id to retrieve album info. Includes tracks info.
 * We remove some of the extra info i dont need.
 */
export async function getSingleAlbumInfo(albumUrl: string, accessToken: string) {
  if (!albumUrl) return undefined
  const url = new URL(albumUrl);
  const id = url.pathname.slice(url.pathname.lastIndexOf('/') + 1,)
  const getAlbumURL = `https://api.spotify.com/v1/albums/${id}`
  const authString = `Bearer ${accessToken}`

  const response = await fetch(getAlbumURL, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${authString}`,
    },
  })
  if (response.ok) {
    const jsonResponse = await response.json()
    const spotifyAlbum = jsonResponse as SpotifyAlbum
    const {
      artists,
      album_type,
      genres,
      href,
      id,
      images,
      label,
      name,
      popularity,
      release_date,
      total_tracks,
      tracks,
      uri,
      type
    } = spotifyAlbum

    // return the uris not all the track info. need the uris to get other track info
    const trackIds = tracks.items.map(track => track.uri)

    return {
      artists,
      album_type,
      genres,
      href,
      id,
      images,
      label,
      name,
      popularity,
      release_date,
      total_tracks,
      uri,
      type,
      trackIds,
      tracks,
    }
  }
}