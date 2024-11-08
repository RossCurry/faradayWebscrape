import Application from "koa";
import { FaradayItemData } from "#controllers/faraday/getItemData.js";
import { SearchResponse, SpotifyAlbumTracksResponse, SpotifySearchResult } from "#controllers/spotify/spotify.types.js";
import { AppContext } from "../../router.js";


type AlbumsInfo = {
  faraday: FaradayItemData;
  spotify: SpotifyAlbumTracksResponse['items'] | undefined;
}
/**
 * Loop over Faraday list and search for a match for each listing.
 * @param ctx 
 */
export default async function getTracksById(ctx: AppContext, next: Application.Next) {
  
  try {
    console.log('!ctx -> ', (ctx as any).request.body);
    const {trackIds} = ((ctx as any).request.body);
    if (!Array.isArray(trackIds) || !trackIds.every(id => typeof id === 'string')) throw new Error('trackIds given is not an array or string')
    console.log('!ctx.body -> ', ctx.body);
    const tracks = await ctx.services.mongo.getSpotifyTracksById(trackIds)
    ctx.body = tracks
    ctx.status = 200
    next()
  } catch (error) {
    ctx.body = { message: 'Something went wrong getting spotify tracks', error }
    ctx.status = 500
  }
}