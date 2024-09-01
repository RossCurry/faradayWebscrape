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
    return {
      artist: artist?.trim(),
      album: album?.trim()
    }
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

/**
 * Find best match from search results & return a reduced json structure
 * @param results 
 * @param searchTerm 
 */
function matchAndProjectSingleSearchResults(itemsArr: SearchResponse["albums"]["items"], searchTerm: string) {
  // console.log('!searchTerm PRE-> ', searchTerm.split(' '));
  const [artist, album] = searchTerm.split(' ')
  console.log('![artist, album] -> ', [artist, album]);
  const [, artistName] = artist.split('artist:')
  const [, albumName] = album.split('album:')
  const decodedArtistName = decodeURI(artistName).trim().toLowerCase()
  const decodedAlbumName = decodeURI(albumName).trim().toLowerCase()
  // const { albums } = results;
  const possibleResults: Array<SearchResponse["albums"]["items"][number]> = []
  const filteredResults = itemsArr.filter(searchResult => {
    const isAlbum = searchResult.name.toLowerCase() === decodedAlbumName
    const hasArtist = searchResult.artists.some(artist => artist.name.toLowerCase() === decodedArtistName)
    return isAlbum || hasArtist
  })
  console.log('!matchAndProjectSingleSearchResults filteredResults -> ', filteredResults);

  const [item] = filteredResults
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



export async function searchSingleAlbum(album: { title: string }, authString: string): Promise<SpotifySearchResult | undefined> {
  try {
    // if (album.isSoldOut || !album.title) return
    const parsedTitle = parseAlbumTitle(album.title)
    const searchTerm = `artist:${parsedTitle.artist}` + ' ' + (parsedTitle.album ? `album:${parsedTitle.album}` : '')
    const limit = 50
    const url = new URL(spotiBaseUrl + 'search')
    url.searchParams.append('q', encodeURIComponent(searchTerm))
    url.searchParams.append('type', 'album')
    // url.searchParams.append('type', 'artist')
    // url.searchParams.append('market', 'es')
    url.searchParams.append('limit', `${limit}`)
    console.log('!searchTerm -> ', searchTerm);
    console.log('!searchSingleAlbum URL -> ', url.toString());
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${authString}`,
      },
    })
    if (!res) throw new Error("No response")
    if ('error' in res){
      throw new Error(JSON.stringify(res))
    }
    const searchResults = await res.json() as unknown as SearchResponse
    console.log('!searchResults.albums.next -> ', searchResults.albums.next);
    let projection: ReturnType<typeof matchAndProjectSingleSearchResults> | undefined;
    if (res.ok) {
      projection = matchAndProjectSingleSearchResults(searchResults.albums.items, searchTerm)
      if (projection) return projection
      else {
        let paginationURL: string | null = searchResults.albums.next
        // const allSearchResults: SearchResponse["albums"]["items"] = [...searchResults.albums.items]
        while (typeof paginationURL === 'string'){
          console.log('!while loop -> ', paginationURL);
          const paginationRes = await fetch(paginationURL, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `${authString}`,
            },
          })
          const paginationResults = await paginationRes.json() as unknown as SearchResponse
          console.log('!paginationResults -> ', paginationResults.albums.items.length);
          console.log('!paginationResults -> ', typeof paginationResults.albums.next);
          paginationURL = paginationResults.albums.next
          projection = matchAndProjectSingleSearchResults(paginationResults.albums.items, searchTerm)
          if (projection) return projection
        }
      }
    }
    return
  } catch (error) {
    throw error
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

  try {
    // TODO for testing only search a few albums, 
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
    ctx.status = 200
    next()
  } catch (error) {
    ctx.body = { message: 'Something went wrong searching spotify searchSingleAlbum', error }
    ctx.status = 500
  }
}