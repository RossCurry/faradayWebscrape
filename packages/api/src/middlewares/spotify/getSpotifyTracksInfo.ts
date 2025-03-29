import Application from "koa";
import { FaradayItemData } from "#controllers/faraday/getItemData.js";
import { SearchResponse, SpotifyAlbumTracksResponse, SpotifySearchResult } from "#controllers/spotify/spotify.types.js";
import { AppContext } from "../../router.js";


/**
 * Loop over Faraday list and search for a match for each listing.
 * @param ctx 
 */
export default async function getSpotifyTracksInfo(ctx: AppContext, next: Application.Next) {
  // TODO might have to run this consecutively
  console.log('!getSpotifyTracksInfo -> ');
  const { spotifyAlbumInfo } = ctx.state.data
  const spotifyAlbums = spotifyAlbumInfo || []
  console.log('!getSpotifyTracksInfo spotifyAlbums.length -> ', spotifyAlbums.length);
  // TODO filter those that have track info
  // const withNoTrackData = spotifyAlbums.filter()
  const allTracksInfo = await Promise.all(spotifyAlbums.map(async (album: SpotifySearchResult) => {
    const authString = `Bearer ${ctx.state.accessToken}`
    if (album.id){
      const spotifyTracks = await searchTracksSingleAlbum(album.id, authString);
      if (!spotifyTracks) return undefined
      if ('error' in spotifyTracks){
        console.log('!spotifyTracks error -> ', spotifyTracks);
        return undefined
      }
      const trackData = {
        album,
        tracks: spotifyTracks as SpotifyAlbumTracksResponse,
      }
      // TODO add to DB as we get the data one by one, otherwise the rate limit kills the request
      await ctx.services.mongo.spotify?.setSpotifyTrackData([{ album: trackData.album, tracks: trackData.tracks}])
      return trackData
    }
  }))
  console.log('!trackInfo -> ', allTracksInfo.filter(info => !!info));
  ctx.state.data = {
    spotifyTrackInfo: allTracksInfo.filter(info => !!info)
  }
  await next()
}

async function searchTracksSingleAlbum(albumId: string, authString: string): Promise<SpotifyAlbumTracksResponse | { error?: Record<string, unknown>}> {
  console.log('!albumId, typeof albumId -> ', albumId, typeof albumId);
  // TODO testing market for tracks info to see if the preview_url will be populated
  const getTracksURL = `https://api.spotify.com/v1/albums/${albumId}/tracks?market=ES`
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
    const searchResults = await res.json() as unknown as SpotifyAlbumTracksResponse
    if (res.ok) {
      return searchResults
    }
    if ('error' in searchResults){
      return { error: searchResults }
    }

    throw new Error(`Error parsing response from URL: ${getTracksURL} res: ${JSON.stringify(res)} parsedRes: ${JSON.stringify(searchResults)}`)
  } catch (error) {
    throw error
  }
}


