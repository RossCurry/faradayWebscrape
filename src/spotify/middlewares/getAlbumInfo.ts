import Application from "koa";
import { FaradayItemData } from "../../faraday/getItemData.js";
import { SearchResponse } from "../spotify.types.js";

const spotiBaseUrl = "https://api.spotify.com/v1/"
const spotiUrl = "https://api.spotify.com/v1/albums/"
const exampleAlbumId = "4aawyAB9vmqN3uQ7FjRGTy"


/**
 * Return album title
 * @param title Expect format 'artist - album' 
 */
function parseAlbumTitle(title: string) {
  const [artist, album] = title.split('-')
  return encodeURI(`${album.trim()} ${artist.trim()}`)
}

/**
 * Return a reduced json structure
 * @param results 
 * @param searchTerm 
 */
function projectResults(results: SearchResponse, searchTerm: string) {
  const { albums } = results;
  const { items } = albums;
  const [item] = items
  const {
    id,
    href,
    name,
    type,
    uri,
    artists
  } = item;

  const projection = {
    searchTerm,
    id,
    href,
    name,
    type,
    uri,
    artists: artists.map(artist => artist.name)
  }
  return projection
}

/**
 * Loop over Faraday list and search for a match for each listing.
 * @param ctx 
 */
export default async function getAlbumInfo(ctx: Application.ParameterizedContext, next: Application.Next) {
  const faradayAlbums: FaradayItemData[] = ctx.state.data.faraday
  // console.log('!faradayAlbums -> ', faradayAlbums);
  const albumInfo = await Promise.all(faradayAlbums.map(async (album: FaradayItemData) => {
    if (album.isSoldOut || !album.title) return
    const type = "type=album,artist"
    const searchTerm = parseAlbumTitle(album.title)
    const limit = 1
    // TODO can probably search all terms together. in which case batches of 50
    const fullUrl = spotiBaseUrl + "search?" + "q=" + searchTerm + "&" + type
    // console.log('fullUrl', fullUrl)
    const authString = `Bearer ${ctx.state.accessToken}`
    const res = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${authString}`,
      },
    })
    if (!res) throw new Error("No response")
    if (res.ok) {
      const searchResults = await res.json() as unknown as SearchResponse
      // console.log("search info", searchResults)
      // await writeSearchResultsToFile({ ...searchResults, searchTerm })
      // await triggerGithubAction()
      const projection = projectResults(searchResults, searchTerm)
      return projection
    }

  }))
  console.log('!searchResults.length -> ', albumInfo.length);
  // TODO filter these results somehow to the best search results
  ctx.state.data = {
    searchResults: albumInfo
  }
  next()
}

// async function singleAlbum(ctx: Application.ParameterizedContext, next: Application.Next) {
//   const authString = `Bearer ${ctx.state.accessToken}`
//   const res = await fetch(spotiUrl + exampleAlbumId, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `${authString}`,
//     },
//   })
//   if (!res) throw new Error("No response")
//   if (res.ok){
//     const albumInfo = await res.json()
//     console.log("albumInfo", albumInfo)
//     ctx.body = albumInfo
//   } else {
//     throw new Error("Res not OK")
//   }
// }