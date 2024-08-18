import Application from "koa";
import { FaradayItemData } from "#controllers/faraday/getItemData.js";
import { SearchResponse, SpotifySearchResult } from "#controllers/spotify/spotify.types.js";
import { AppContext } from "../../router.js";

const spotiBaseUrl = "https://api.spotify.com/v1/"
const spotiUrl = "https://api.spotify.com/v1/albums/"
const exampleAlbumId = "4aawyAB9vmqN3uQ7FjRGTy"


/**
 * Return album title
 * @param title Expect format 'artist - album' 
 */
function parseAlbumTitle(title: string) {
  const [artist, album] = title.split('-')
  try {
    return encodeURI(`${artist?.trim()} ${album?.trim()}`)
  } catch (error) {
    throw new Error(`Error parsing faraday album info, artist: ${artist} album: ${album}`)
  }
}


export type ProjectionResultsMultiple = ReturnType<typeof projectMultipsSearchResults>
export type ProjectionResultsSingle = ReturnType<typeof projectSingleSearchResults>
/**
 * Return a reduced json structure
 * @param results 
 * @param searchTerm 
 */
function projectMultipsSearchResults(results: SearchResponse, searchTerm: string) {
  const { albums } = results;
  const { items } = albums;
  return items.map(item => {
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
  })
}

/**
 * Return a reduced json structure
 * @param results 
 * @param searchTerm 
 */
function projectSingleSearchResults(results: SearchResponse, searchTerm: string) {
  const { albums } = results;
  const { items } = albums;
  const [item] = items
  if (!item) return
  const {
    id,
    href,
    name,
    type,
    uri,
    artists,
    images
  } = item;

  const [image] = images
  const projection = {
    artists: artists.map((artist: { name: string }) => artist.name),
    href,
    id,
    image,
    name,
    searchTerm,
    type,
    uri,
  }
  return projection
}

// /**
//  * Return batches of 50
//  * @param albums 
//  */
// function getBatches(albums: FaradayItemData[]) {
//   const batches: FaradayItemData[][] = []
//   function recurse(albums: FaradayItemData[]) {
//     if (!albums.length) return
//     const fiftyOrLess = albums.slice(0, 50)
//     const rest = albums.slice(50,)
//     batches.push(fiftyOrLess)
//     recurse(rest)
//   }
//   recurse(albums)
//   return batches
// }

/**
 * Loop over Faraday list and search for a match for each listing.
 * @param ctx 
 */
export default async function getAlbumInfoSpotify(ctx: AppContext, next: Application.Next) {
  console.log('!getAlbumInfoSpotify -> ');
  const { faraday } = ctx.state.data
  const faradayAlbums = faraday?.cleanItems || [] 
  // TODO check data from faraday against saved data
  // TODO skip search if everything is the same
  // TODO only search differences
  // const skip = true;
  // if (skip) next()

  // TODO for testing only search a few albums, 
  // TODO write this data to disk to avoid repeated calls to spoti API
  const albumInfo = await Promise.all(faradayAlbums.map(async (album: FaradayItemData) => {
    const authString = `Bearer ${ctx.state.accessToken}`
    const faraday = album;
    const spotify = await searchSingleAlbum(album, authString);
    return {
      faraday,
      spotify
    }
  }))
  // const batches = getBatches(faradayAlbums)
  // const albumInfo = await Promise.all(batches.map(async (albums: FaradayItemData[]) => {
  //   const authString = `Bearer ${ctx.state.accessToken}`
  //   return  searchMultiplAlbums(albums, authString)
  // }))
  ctx.state.data = {
    searchResults: albumInfo.filter(info => !!info.spotify)
  }
  next()
}

async function searchSingleAlbum(album: FaradayItemData, authString: string): Promise<SpotifySearchResult | undefined> {
  if (album.isSoldOut || !album.title) return
  const searchTerm = parseAlbumTitle(album.title)
  const limit = 1
  const url = new URL(spotiBaseUrl + 'search')
  url.searchParams.append('q', searchTerm)
  url.searchParams.append('type', 'album')
  url.searchParams.append('type', 'artist')
  url.searchParams.append('limit', `${limit}`)
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${authString}`,
    },
  })
  if (!res) throw new Error("No response")
  if (res.ok) {
    const searchResults = await res.json() as unknown as SearchResponse
    const projection = projectSingleSearchResults(searchResults, searchTerm)
    return projection
  }
}

// TODO don't use, not working as expected
async function searchMultiplAlbums(albums: FaradayItemData[], authString: string) {
  const filtered = albums
    .filter(album => {
      return (!album.isSoldOut && album.title)
    })
    .map(album => {
      return parseAlbumTitle(album.title)
    })
  const type = "type=album,artist"
  const searchTerm = filtered.join(',')
  const limit = 50
  // TODO can probably search all terms together. in which case batches of 50
  const fullUrl = spotiBaseUrl + "search?" + "q=" + searchTerm + "&" + type
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
    const projection = projectMultipsSearchResults(searchResults, searchTerm)
    return projection
  }
}

