import Application from "koa";
import { FaradayItemData } from "#controllers/faraday/getItemData.js";
import { SearchResponse, SpotifySearchResult } from "#controllers/spotify/spotify.types.js";
import { AppContext } from "../../router.js";

const spotiBaseUrl = "https://api.spotify.com/v1/"
const spotiUrl = "https://api.spotify.com/v1/albums/"
const exampleAlbumId = "4aawyAB9vmqN3uQ7FjRGTy"

function convertToEnglishAlphabet(str: string) {
  // Normalize the string to decompose special characters
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
}

function parseNoHyphenFound(words: string[]){
  console.log('!parseNoHyphenFound -> ');
  // Try and find a word with hyphen
  let hyphenIndex;
  let artist;
  let album;
  const hasHyphen = words.filter((word, index) => {
    const hasHyphen = word.includes('-')
    if (hasHyphen) hyphenIndex = index
    return hasHyphen
  })
  console.log('!hasHyphen -> ', hasHyphen);
  if (hasHyphen.length === 1 && hyphenIndex){
    artist = words.slice(0,hyphenIndex).join(' ')
    album = words.slice(hyphenIndex).join(' ').replace('-', '')
    console.log('!hasHyphen album -> ', album, artist);
    return {
      artist: artist?.trim(),
      album: album?.trim()
    }
  }
}

function parseWordsNotSeparated(words: string[]){
  console.log('!parseWordsNotSeparated -> ');
  const split = words.map( word => {
    // First, handle the case where there are no spaces but a camelCase or PascalCase structure
    const camelCaseSplit = word.replace(/([a-z])([A-Z])/g, '$1 $2');
    // Then, split the string by spaces
    const res = camelCaseSplit.split(' ');
    return res;
  }).flat()
  // No hyphen so Just guess, first word is artist
  const halfWay = Math.floor(split.length/2)
  let artist = split.slice(0,halfWay).join(' ');
  let album = split.slice(halfWay).join(' ')
  return {
    artist: artist?.trim(),
    album: album?.trim()
  }
}
/**
 * Return album title
 * @param title Expect format 'artist - album' 
 */
function parseAlbumTitle(title: string): ParsedTitle {
  console.log('!parseAlbumTitle -> ', title);
  // const [artist, album] = title.split('-')
  // decode, split and normalise letters
  const words = decodeURIComponent(title)
    .split(' ')
    .map(word => convertToEnglishAlphabet(word))
  const divisionIndex = words.indexOf('-')
  console.log('!divisionIndex -> ', divisionIndex);
  let artist;
  let album
  let parsed;
  const error = new Error(`Error parsing faraday album info, artist: ${artist} album: ${album}`)
  try {
    if (divisionIndex > -1){
      // Happy path
      artist = words.slice(0,divisionIndex).join(' ')
      album = words.slice(divisionIndex + 1).join(' ')
      return {
        artist: artist?.trim(),
        album: album?.trim()
      }
    }
    parsed = parseNoHyphenFound(words)
    if (!parsed) {
      parsed = parseWordsNotSeparated(words)
    }

    if (!parsed) throw error
    return parsed
  } catch (e) {
    throw error
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
    console.log('!matched single result album name -> ', searchResult.name);
    console.log('!matched single result artists name -> ', searchResult.artists.map(a => a.name));
    const isAlbum = searchResult.name.toLowerCase() === decodedAlbumName
    const hasArtist = searchResult.artists.some(artist => {
      return convertToEnglishAlphabet(artist.name).toLowerCase() === decodedArtistName
    })
    return isAlbum || hasArtist
  })

  console.log('!matchedArtistOrAlbum -> ', matchedArtistOrAlbum);
  console.log('!matchResults filteredResults len -> ', matchedArtistOrAlbum.length);
  // If we get too many results for album or artist match, 
  // filter again by matching artists names and giving a score
  if (matchedArtistOrAlbum.length > 1){
    const scores = matchedArtistOrAlbum.map((searchResult, i) => {
      const isAlbum = searchResult.name.toLowerCase() === decodedAlbumName
      const artistSingleNames = decodedArtistName.split(' ')
      let score = 0
      searchResult.artists.forEach((artist) => {
        // try and get a score from individual matches
        const splitNames = convertToEnglishAlphabet(artist.name).toLowerCase().split(' ')
        // see if any match
        splitNames.forEach(name => {
          if (artistSingleNames.includes(name)) score++
        })
      })
      const matchScore = [i , score]
      return matchScore
    })
    // sort by scores
    scores.sort((a, b) => b[1] - a[1])
    const [bestMatch] = scores
    const bestMatchIndex = bestMatch[0]
    // Return best score result. expects an array
    return [matchedArtistOrAlbum[bestMatchIndex]]
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
    genres,
    album_type,
    total_tracks,
    release_date,
    popularity
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
    genres,
    albumType: album_type,
    totalTracks: total_tracks,
    releaseDate: release_date,
    popularity
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
    const parsedTitle = parseAlbumTitle(album.title)
    console.log('!parsedTitle -> ', parsedTitle);
    const searchTerm = encodeURIComponent(`artist:${parsedTitle.artist}` + ' ' + (parsedTitle.album ? `album:${parsedTitle.album}` : ''))
    const limit = 50
    const url = new URL(spotiBaseUrl + 'search')
    url.searchParams.append('q', searchTerm)
    url.searchParams.append('type', 'album')
    url.searchParams.append('type', 'artist')
    url.searchParams.append('limit', `${limit}`)
    
    console.log('!searchTerm -> ', searchTerm);
    console.log('!searchSingleAlbum URL -> ', url.toString());

    // Pagination
    const errors = []
    let albumURL: string = url.toString()
    while (albumURL) {
      const res = await fetch(albumURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${authString}`,
        },
      })

      // Spotify Network Errors
      if (!res) throw new Error("No response")
        
      if ('error' in res){
        // TODO add handling for specific error cases
        throw new Error(JSON.stringify(res))
      }

      if (!res.ok) {
        throw new Error(`Faraday.title: ${album.title} | Error status: ${(res.status)}: ${(res.statusText)}`)
      }

      // Parse results
      const searchResults = await res.json() as unknown as SearchResponse

      const matchedResults = matchResults(searchResults.albums.items, parsedTitle)
      const projection = getProjection(matchedResults, searchTerm)
      if (projection) return projection
      albumURL = searchResults.albums.next // might also be undefined
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