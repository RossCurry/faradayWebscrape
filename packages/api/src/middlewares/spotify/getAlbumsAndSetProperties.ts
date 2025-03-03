import Application from "koa";
import { AppContext } from "#router/";
import { SpotifyAlbum } from "#controllers/spotify/spotify.types.js";
// import { AppContext } from "../../router.js";

export default async function getAlbumsAndSetProperties(ctx: AppContext, _next: Application.Next) {
  // TODO get properties to set from the params/query/body
  const spotfiyAlbums = await ctx.services.mongo.spotify?.getSpotifyData()
  if (!spotfiyAlbums) throw new Error('No spotify albums found');

  let updatedCount = 0
  const errors = []
  // For each album get details
  for (const album of spotfiyAlbums){
    const { id } = album
    const getAlbumURL = `https://api.spotify.com/v1/albums/${id}`
    const authString = `Bearer ${ctx.state.accessToken}`
    try {
      const response = await fetch(getAlbumURL, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${authString}`,
        },
      })
      if (response.ok){
        const jsonResponse = await response.json()
        const {
          album_type,
          total_tracks,
          release_date,
          genres,
          popularity
        } = jsonResponse as SpotifyAlbum
        const updated = await ctx.services.mongo.spotify?.updateSpotifyAlbumFields({
          id,
          album_type,
          total_tracks,
          release_date,
          genres,
          popularity
        })
        updatedCount++
      }
    } catch (error) {
      errors.push(error)
    }
  }
  ctx.body = { updatedCount, errorCount: errors.length }
}

