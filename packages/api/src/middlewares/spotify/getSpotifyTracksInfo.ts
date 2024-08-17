import Application from "koa";
import { FaradayItemData } from "#controllers/faraday/getItemData.js";
import { SearchResponse, SpotifyAlbumTracksResponse, SpotifySearchResult } from "#controllers/spotify/spotify.types.js";
import { AppContext } from "../../router.js";


/**
 * Loop over Faraday list and search for a match for each listing.
 * @param ctx 
 */
export default async function getSpotifyTracksInfo(ctx: AppContext, next: Application.Next) {
  console.log('!getSpotifyTracksInfo -> ');
  const { spotifyAlbumInfo } = ctx.state.data
  const spotifyAlbums = spotifyAlbumInfo || []
  console.log('!getSpotifyTracksInfo spotifyAlbums.length -> ', spotifyAlbums.length);
  // TODO filter those that have track info
  // const withNoTrackData = spotifyAlbums.filter()
  const trackInfo = await Promise.all(spotifyAlbums.map(async (album: SpotifySearchResult) => {
    const authString = `Bearer ${ctx.state.accessToken}`
    console.log('!album -> ', album);
    if (album.id){
      const spotifyTracks: SpotifyAlbumTracksResponse = await searchTracksSingleAlbum(album.id, authString);
      return {
        album,
        tracks: spotifyTracks,
      }
    }
  }))
  console.log('!trackInfo -> ', trackInfo.filter(info => !!info));
  ctx.state.data = {
    spotifyTrackInfo: trackInfo.filter(info => !!info)
  }
  next()
}

async function searchTracksSingleAlbum(albumId: string, authString: string): Promise<SpotifyAlbumTracksResponse> {
  console.log('!albumId, typeof albumId -> ', albumId, typeof albumId);
  const getTracksURL = `https://api.spotify.com/v1/albums/${albumId}/tracks`
  const url = new URL(getTracksURL)
  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${authString}`,
      },
    })
    if (!res) throw new Error("No response")
    if (res.ok) {
      const searchResults = await res.json() as unknown as SpotifyAlbumTracksResponse
      return searchResults
    }
    throw new Error(`Error parsing response from URL: ${getTracksURL} res: ${JSON.stringify(res)}`)
  } catch (error) {
    throw error
  }
}


