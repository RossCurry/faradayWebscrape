const spotiBaseUrl = "https://api.spotify.com/v1/";
const spotiUrl = "https://api.spotify.com/v1/albums/";
const exampleAlbumId = "4aawyAB9vmqN3uQ7FjRGTy";
function convertToEnglishAlphabet(str) {
    // Normalize the string to decompose special characters
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function normalizeArtists(artists) {
    return artists.map(a => normalizeName(a.name)).join(' ').toLowerCase().trim();
}
function normalizeName(name, noRegex = false) {
    const formattedName = name.split(' ').map(word => {
        if (word === '&')
            return 'and';
        return word;
    }).join(' ');
    // use english alphabet and remove special characters: not a letter, number, or whitespace
    const normalized = convertToEnglishAlphabet(formattedName).toLowerCase().trim();
    return noRegex ? normalized : normalized.replace(/[^a-zA-Z0-9\s]/g, "");
}
function parseNoHyphenFound(words) {
    console.log('!parseNoHyphenFound -> ');
    // Try and find a word with hyphen
    let hyphenIndex;
    let artists;
    let albums;
    const hasHyphen = words.filter((word, index) => {
        const hasHyphen = word.includes('-');
        if (hasHyphen)
            hyphenIndex = index;
        return hasHyphen;
    });
    console.log('!hasHyphen -> ', hasHyphen.length, hasHyphen, hyphenIndex);
    // TODO the cases where the hyphen is connected and start of word
    // TODO the cases where the hyphen is connected and end of word
    if (hasHyphen.length === 1 && hyphenIndex) {
        const hyphedWord = words.at(hyphenIndex);
        const addToAlbum = hyphedWord?.startsWith('-');
        const addToArtist = hyphedWord?.endsWith('-');
        const wordToAdd = hyphedWord?.replace('-', '') || '';
        console.log('!wordToAdd -> ', wordToAdd);
        console.log('!addToAlbum -> ', addToAlbum);
        console.log('!addToArtist -> ', addToArtist);
        console.log('!no mod artist -> ', words.slice(0, hyphenIndex));
        console.log('!no mod album -> ', words.slice(hyphenIndex));
        if (addToArtist) {
            artists = words.slice(0, hyphenIndex);
            artists = artists.concat(wordToAdd).join(' ').trim();
            // words.slice(0,hyphenIndex-1)
            albums = words.slice(hyphenIndex + 1).join(' ').trim();
            // words.slice(hyphenIndex-1) : 
        }
        if (addToAlbum) {
            artists = words.slice(0, hyphenIndex).join(' ').trim();
            albums = words.slice(hyphenIndex + 1);
            albums = [wordToAdd, ...albums].join(' ');
        }
        console.log('!hasHyphen albums -> ', albums);
        console.log('!hasHyphen artists -> ', artists);
        return {
            artist: artists || '',
            album: albums || '',
        };
    }
}
function parseWordsNotSeparated(words) {
    console.log('!parseWordsNotSeparated -> ');
    const split = words.map(word => {
        // First, handle the case where there are no spaces but a camelCase or PascalCase structure
        const camelCaseSplit = word.replace(/([a-z])([A-Z])/g, '$1 $2');
        // Then, split the string by spaces
        const res = camelCaseSplit.split(' ');
        return res;
    }).flat();
    // No hyphen so Just guess, first word is artist
    const halfWay = Math.floor(split.length / 2);
    let artist = split.slice(0, halfWay).join(' ');
    let album = split.slice(halfWay).join(' ');
    return {
        artist: artist?.trim(),
        album: album?.trim()
    };
}
/**
 * Return album title
 * @param title Expect format 'artist - album'
 */
function parseAlbumTitle(title) {
    console.log('!parseAlbumTitle -> ', title);
    // const [artist, album] = title.split('-')
    // decode, split and normalise letters
    // const words = decodeURIComponent(title) // decodeURIComponent is throwing errors for certain strings
    const words = title
        .split(' ')
        .map(word => normalizeName(word, true))
        .filter(word => word.length > 0);
    console.log('!words -> ', words);
    const divisionIndex = words.indexOf('-');
    console.log('!divisionIndex -> ', divisionIndex);
    let artist;
    let album;
    let parsed;
    const error = new Error(`Error parsing faraday album info, artist: ${artist} album: ${album}`);
    try {
        if (divisionIndex > -1) {
            // Happy path
            artist = words.slice(0, divisionIndex).join(' ');
            album = words.slice(divisionIndex + 1).join(' ');
            return {
                artist: artist?.trim(),
                album: album?.trim()
            };
        }
        parsed = parseNoHyphenFound(words);
        if (!parsed) {
            parsed = parseWordsNotSeparated(words);
        }
        if (!parsed)
            throw error;
        return parsed;
    }
    catch (e) {
        throw error;
    }
}
/**
 * Return a reduced json structure
 * @param results
 * @param searchTerm
 */
function projectMultipsSearchResults(results, searchTerm) {
    const { albums } = results;
    const { items } = albums;
    return items.map(item => {
        const { id, href, name, type, uri, artists } = item;
        const projection = {
            searchTerm,
            id,
            href,
            name,
            type,
            uri,
            artists: artists.map(artist => artist.name)
        };
        return projection;
    });
}
/**
 * Return a reduced json structure
 * @param results
 * @param searchTerm
 */
function projectSingleSearchResults(results, searchTerm) {
    const { albums } = results;
    const { items } = albums;
    const [item] = items;
    if (!item)
        return;
    const { id, href, name, type, uri, artists, images } = item;
    const [image] = images;
    const projection = {
        artists: artists.map((artist) => artist.name),
        href,
        id,
        image,
        name,
        searchTerm,
        type,
        uri,
    };
    return projection;
}
/**
 * Tries to match results found from Spotify with original search artist and album
 */
function matchResults(searchResponse, albumAndArtist) {
    console.log('!matchResults -> ', searchResponse.length);
    const { album, artist } = albumAndArtist;
    const artistSearchTerm = normalizeName(artist);
    const albumSearchTerm = normalizeName(album);
    console.log('!artistSearchTerm -> ', artistSearchTerm);
    console.log('!albumSearchTerm -> ', albumSearchTerm);
    let foundExactMatch = null;
    // Filter searchResults - try and find a matching artist or album
    const matchedArtistOrAlbum = searchResponse.filter(searchResult => {
        console.log('!matched single result album name -> ', searchResult.name);
        console.log('!matched single result artists name -> ', searchResult.artists.map(a => a.name));
        const isAlbum = normalizeName(searchResult.name) === albumSearchTerm;
        const isArtist = normalizeArtists(searchResult.artists) === artistSearchTerm;
        if (isAlbum && isArtist)
            foundExactMatch = searchResult;
        const hasArtist = searchResult.artists.some(artist => {
            return normalizeName(artist.name) === artistSearchTerm;
        });
        const hasAlbum = normalizeName(searchResult.name).includes(albumSearchTerm);
        return hasAlbum || hasArtist;
    });
    // Return early if we found an exact match already
    if (foundExactMatch)
        return foundExactMatch;
    // console.log('!matchedArtistOrAlbum -> ', matchedArtistOrAlbum);
    console.log('!matchedArtistOrAlbum -> ', matchedArtistOrAlbum.map(res => ({
        album: normalizeName(res.name),
        artist: normalizeArtists(res.artists)
    })));
    console.log('!matchResults filteredResults len -> ', matchedArtistOrAlbum.length);
    // If we get too many results for album or artist match, 
    // filter again by matching artists names and giving a score
    // if (matchedArtistOrAlbum.length > 1){
    if (matchedArtistOrAlbum.length) {
        const scores = matchedArtistOrAlbum.map((searchResult, i) => {
            const isAlbumMatch = normalizeName(searchResult.name) === albumSearchTerm;
            const containsAlbumMatch = normalizeName(searchResult.name).includes(albumSearchTerm);
            const containsArtistMatch = normalizeArtists(searchResult.artists).includes(artistSearchTerm);
            let score = 0;
            // If the album name is an exact Match give it a high score
            // if (isAlbumMatch) score += 5
            // if (containsArtistMatch) score += 10
            if (containsAlbumMatch)
                score += 2;
            searchResult.artists.forEach((artist) => {
                // try and get a score from individual matches
                const splitNames = normalizeName(artist.name).split(' ');
                // see if any match
                const artistSingleNames = artistSearchTerm.split(' ');
                splitNames.forEach(name => {
                    const nameIsInSearch = artistSingleNames.some(singleName => name.includes(singleName));
                    console.log('!increase name score -> ', nameIsInSearch, artistSingleNames, 'includes', name);
                    if (nameIsInSearch) {
                        score++;
                    }
                });
            });
            // tuple of [index, score]
            const matchScore = [i, score];
            return matchScore;
        });
        // sort by scores
        scores.sort((a, b) => b[1] - a[1]);
        const [bestMatch] = scores;
        const bestMatchIndex = bestMatch[0];
        // Return best score result
        const bestResult = matchedArtistOrAlbum.at(bestMatchIndex);
        console.log('!bestResult -> ', bestResult);
        if (!bestResult)
            return null;
        // Strict album match
        const isStrictAlbumMatch = normalizeName(bestResult.name).includes(albumSearchTerm);
        console.log('!isStrictAlbumMatch -> ', isStrictAlbumMatch, normalizeName(bestResult.name), albumSearchTerm);
        // Strict artist match
        const isStrictArtistMatch = normalizeArtists(bestResult.artists).includes(artistSearchTerm);
        console.log('!isStrictArtistMatch -> ', isStrictArtistMatch, normalizeArtists(bestResult.artists), artistSearchTerm);
        if (isStrictAlbumMatch && isStrictArtistMatch)
            return bestResult;
    }
    return null;
}
/**
 * Gets final projection from matched results
 */
function getProjection(filteredResult, searchTerm) {
    console.log('!getProjection(filteredResults len-> ', filteredResult);
    if (!filteredResult)
        return;
    const { id, href, name, type, uri, artists, images, genres, album_type, total_tracks, release_date, popularity } = filteredResult;
    const [image] = images;
    const projection = {
        artists: artists.map((artist) => artist.name),
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
    };
    return projection;
}
/**
 * Searches for a single album on Spotify, using pagination to search through all the results.
 * @param album
 * @param authString
 * @returns
 */
// export async function searchSingleAlbum(album: Partial<FaradayItemData>, authString: string): Promise<SpotifySearchProjection | undefined> {
export async function searchSingleAlbum(album, authString) {
    console.log('!searchSingleAlbum -> ', album.title);
    // TODO test which is better.
    const title = album.linkLabel || album.title;
    if (!title)
        throw new Error('No title to search');
    try {
        const parsedTitle = parseAlbumTitle(title);
        console.log('!parsedTitle -> ', parsedTitle);
        // TODO I'm making adjustments here. The spotify website shows a double encoding.
        // const unencodedSearchTerm = `artist:${encodeURIComponent(parsedTitle.artist)}`
        // const unencodedSearchTerm = `album:${encodeURIComponent(parsedTitle.album)}`
        const unencodedSearchTerm = `artist:${encodeURIComponent(parsedTitle.artist)}`
            + encodeURIComponent(' ')
            + (parsedTitle.album ? `album:${encodeURIComponent(parsedTitle.album)}` : '');
        const searchTerm = encodeURIComponent(unencodedSearchTerm);
        const limit = 50;
        const url = new URL(spotiBaseUrl + 'search');
        url.searchParams.append('q', searchTerm);
        url.searchParams.append('type', 'album');
        url.searchParams.append('type', 'artist');
        url.searchParams.append('market', 'ES');
        // url.searchParams.append('include_external', 'audio')
        url.searchParams.append('limit', `${limit}`);
        console.log('!searchTerm -> ', searchTerm);
        console.log('!searchSingleAlbum URL -> ', url.toString());
        // Pagination
        const errors = [];
        let albumURL = url.toString();
        while (albumURL) {
            const res = await fetch(albumURL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${authString}`,
                },
            });
            // Spotify Network Errors
            if (!res)
                throw new Error("No response");
            if ('error' in res) {
                // TODO add handling for specific error cases
                throw new Error(JSON.stringify(res), { cause: res.error });
            }
            if (!res.ok) {
                throw new Error(`Faraday.title: ${album.title} | Error status: ${(res.status)}: ${(res.statusText)}`, { cause: JSON.stringify(res) });
            }
            // Parse results
            const searchResults = await res.json();
            // console.log('!searchResults -> ', JSON.stringify(searchResults));
            // TODO check matched results. I can see in the logs that sometime the match should be made but isn't.
            const matchedResults = matchResults(searchResults.albums.items, parsedTitle);
            const projection = getProjection(matchedResults, searchTerm);
            if (projection)
                return projection;
            albumURL = searchResults.albums.next; // might also be undefined
        }
    }
    catch (error) {
        console.error(error);
        throw error;
    }
}
/**
 * Loop over Faraday list and search for a match for each listing.
 * @param ctx
 */
export default async function getAlbumInfoSpotify(ctx, next) {
    console.log('!getAlbumInfoSpotify -> ');
    const { faraday } = ctx.state.data;
    const faradayAlbums = faraday?.cleanItems || [];
    // TODO check data from faraday against saved data
    // TODO skip search if everything is the same
    // TODO only search differences
    // Dont use map, as the concurrent approach burns the rate limit.
    try {
        const albumsInfo = [];
        for (const album of faradayAlbums) {
            console.log('!Current album search -> ', album.title);
            const authString = `Bearer ${ctx.state.accessToken}`;
            const faraday = album;
            const spotifySearchResult = await searchSingleAlbum(album, authString);
            console.log('!searchSingleAlbum result-> ', spotifySearchResult);
            // If we dont find any result, set it as not found in the DB so as not to search for it again
            if (!spotifySearchResult) {
                await ctx.services.mongo.faraday?.setFaradayIdAsNotFound(faraday.id);
                continue;
            }
            ;
            const faradayData = await ctx.services.mongo.faraday?.getFaradayData();
            if (!faradayData)
                throw new Error('No faradayData found');
            // set directly in the DB - hitting all sort of rate limits 😂
            await ctx.services.mongo.spotify?.setSpotifyData([{
                    faraday,
                    spotify: spotifySearchResult
                }], faradayData);
            albumsInfo.push({
                faraday,
                spotify: spotifySearchResult
            });
        }
        // TODO 
        // const filteredSearchResults = albumsInfo.filter(info => !!info.spotify)
        console.log('!getAlbumInfoSpotify albumsInfo len -> ', albumsInfo.length);
        ctx.state.data = {
            searchResults: albumsInfo
        };
        ctx.body = { updated: albumsInfo.length, albumsInfo };
        ctx.status = 200;
        await next();
    }
    catch (error) {
        ctx.body = { message: 'Something went wrong searching spotify searchSingleAlbum', error };
        ctx.status = 500;
    }
}
