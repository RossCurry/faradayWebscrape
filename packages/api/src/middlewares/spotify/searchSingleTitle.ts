import Application from "koa";
import { AppContext } from "../../router.js";
import { searchSingleAlbum } from "./getAlbumInfo.js";

/**
 * Loop over Faraday list and search for a match for each listing.
 * @param ctx 
 */
export default async function searchSingleTitle(ctx: AppContext, next: Application.Next) {
  console.log('!searchSingleTitle -> ');
  const searchString = ctx.querystring
  console.log('!searchString -> ', searchString);
  try {
    const accessToken = ctx.services.token.get()
    if (!searchString) throw new Error('No Query string found')
    const authString = `Bearer ${accessToken}`
    const searchItem = { title: searchString }
    const spotify = await searchSingleAlbum(searchItem, authString);
    console.log('!searchSingleAlbum result -> ', spotify);
    ctx.body = { result: spotify || 'none found' }
    ctx.status = 200
    next()
  } catch (error) {
    ctx.body = { message: 'Something went wrong searching spotify searchSingleAlbum', error }
    ctx.status = 500
  }
}
