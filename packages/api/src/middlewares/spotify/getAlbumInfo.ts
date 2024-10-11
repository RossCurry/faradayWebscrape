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
  console.log('!parseAlbumTitle -> ', title);
  // const [artist, album] = title.split('-')
  const words = decodeURIComponent(title).split(' ')
  const divisionIndex = words.indexOf('-')
  const artist = words.slice(0,divisionIndex).join(' ')
  const album = words.slice(divisionIndex + 1).join(' ')
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
 * Tries to match results found from Spotify with original search artist and album
 */
function matchResults(itemsArr: SearchResponse["albums"]["items"], albumAndArtist: ParsedTitle): SearchResponse["albums"]["items"] {
  console.log('!matchResults -> ', itemsArr.length);

  const { album, artist } = albumAndArtist
  const decodedArtistName = artist.trim().toLowerCase()
  const decodedAlbumName = album.trim().toLowerCase()
  console.log('!decodedArtistName -> ', decodedArtistName);
  console.log('!decodedAlbumName -> ', decodedAlbumName);

  const matchedArtistOrAlbum = itemsArr.filter(searchResult => {
    // console.log('!searchResult -> ', searchResult.name);
    const isAlbum = searchResult.name.toLowerCase() === decodedAlbumName
    const hasArtist = searchResult.artists.some(artist => {
      return artist.name.toLowerCase() === decodedArtistName
    })
    return isAlbum || hasArtist
  })

  console.log('!matchResults filteredResults len -> ', matchedArtistOrAlbum.length);
  // If we get too many results for album or artist match, filter again matching both
  if (matchedArtistOrAlbum.length > 1){
    return matchedArtistOrAlbum.filter(searchResult => {
      const isAlbum = searchResult.name.toLowerCase() === decodedAlbumName
      const hasArtist = searchResult.artists.some(artist => artist.name.toLowerCase() === decodedArtistName)
      return isAlbum && hasArtist
    }) as SearchResponse["albums"]["items"]
  }

  return matchedArtistOrAlbum as SearchResponse["albums"]["items"]
}

// TODO figure out what to do with so many match results, at the moment I just take the first one
/**
 * Gets final projection from matched results
 */
function getProjection(filteredResults:  SearchResponse["albums"]["items"], searchTerm: string){
  console.log('!getProjection(filteredResults len-> ', filteredResults.length );
  if (!filteredResults.length) return
  const [item] = filteredResults
  if (!item) return
  const {
    id,
    href,
    name,
    type,
    uri,
    artists,
    images,
    genres
  } = item;

  const [image] = images
  const projection = {
    artists: artists.map((artist: { name: string }) => artist.name),
    href,
    id,
    image,
    name,
    searchTerm: searchTerm,
    type,
    uri,
    genres
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

type ParsedTitle = {
  album: string,
  artist: string,
}

/**
 * Searches for a single album on Spotify, using pagination to search through all the results.
 * @param album 
 * @param authString 
 * @returns 
 */
export async function searchSingleAlbum(album: { title: string }, authString: string): Promise<SpotifySearchResult | undefined> {
  console.log('!searchSingleAlbum -> ', album.title);
  try {
    // if (album.isSoldOut || !album.title) return
    const parsedTitle = parseAlbumTitle(album.title)
    console.log('!parsedTitle -> ', parsedTitle);
    const searchTerm = encodeURIComponent(`artist:${parsedTitle.artist}` + ' ' + (parsedTitle.album ? `album:${parsedTitle.album}` : ''))
    const limit = 50
    const url = new URL(spotiBaseUrl + 'search')
    url.searchParams.append('q', searchTerm)
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
    console.log('!res.ok -> ', res.ok);
    if (!res.ok) throw new Error(`Faraday.title: ${album.title} | Error status: ${(res.status)}: ${(res.statusText)}`)
    console.log('!searchResults has pagination -> ', !!searchResults.albums.next);
    let projection: ReturnType<typeof getProjection> | undefined;
    if (res.ok) {
      const matchedResults = matchResults(searchResults.albums.items, parsedTitle)
      projection = getProjection(matchedResults, searchTerm)
      // projection = matchAndProjectSingleSearchResults(searchResults.albums.items, parsedTitle)
      if (projection) return projection
      else {
        let paginationURL: string | null = searchResults.albums.next
        // const allSearchResults: SearchResponse["albums"]["items"] = [...searchResults.albums.items]
        while (typeof paginationURL === 'string'){
          console.log('!while loop -> ', paginationURL);
          try {
            const paginationRes = await fetch(paginationURL, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `${authString}`,
              },
            })
            if ('error' in paginationRes){
              throw new Error(JSON.stringify(paginationRes))
            }
            const paginationResults = await paginationRes.json() as unknown as SearchResponse
            console.log('!paginationResults -> ', paginationResults.albums.items.length);
            console.log('!paginationResults -> ', typeof paginationResults.albums.next);
            paginationURL = paginationResults.albums.next
            // projection = matchAndProjectSingleSearchResults(paginationResults.albums.items, searchTerm)
            const matchedResults = matchResults(paginationResults.albums.items, parsedTitle)
            projection = getProjection(matchedResults, searchTerm)
            if (projection) return projection
          } catch (error) {
            throw error
          }
        }
      }
    }
  } catch (error) {
    console.error(error)
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

type AlbumsInfo = {
  faraday: FaradayItemData;
  spotify: SpotifySearchResult | undefined;
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

  // Dont use map, as the concurrent approach burns the rate limit.
  try {
    // TODO for testing only search a few albums,
    const albumsInfo: AlbumsInfo[] = []
    for (const album of faradayAlbums){
      console.log('!Current album search -> ', album.title);
      const authString = `Bearer ${ctx.state.accessToken}`
      const faraday = album;
      const spotify = await searchSingleAlbum(album, authString);
      console.log('!searchSingleAlbum result-> ', spotify);
      // If we dont find any result, set it as not found in the DB so as not to search for it again
      if (!spotify) {
        await ctx.services.mongo.setFaradayIdAsNotFound(faraday.id);
        continue
      };
      // set directly in the DB - hitting all sort of rate limits 😂
      await ctx.services.mongo.setSpotifyData([{
        faraday,
        spotify
      }])
      albumsInfo.push({
        faraday,
        spotify
      })
    }

    // TODO 
    // const filteredSearchResults = albumsInfo.filter(info => !!info.spotify)
    console.log('!getAlbumInfoSpotify albumsInfo len -> ', albumsInfo.length);
    ctx.state.data = {
      searchResults: albumsInfo
    }
    ctx.body = { updated: albumsInfo.length, albumsInfo }
    ctx.status = 200
    next()
  } catch (error) {
    ctx.body = { message: 'Something went wrong searching spotify searchSingleAlbum', error }
    ctx.status = 500
  }
}