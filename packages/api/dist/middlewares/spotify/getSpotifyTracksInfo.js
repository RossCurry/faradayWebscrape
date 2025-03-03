/**
 * Loop over Faraday list and search for a match for each listing.
 * @param ctx
 */
export default async function getSpotifyTracksInfo(ctx, next) {
    // TODO might have to run this consecutively
    console.log('!getSpotifyTracksInfo -> ');
    const { spotifyAlbumInfo } = ctx.state.data;
    const spotifyAlbums = spotifyAlbumInfo || [];
    console.log('!getSpotifyTracksInfo spotifyAlbums.length -> ', spotifyAlbums.length);
    // TODO filter those that have track info
    // const withNoTrackData = spotifyAlbums.filter()
    const allTracksInfo = await Promise.all(spotifyAlbums.map(async (album) => {
        const authString = `Bearer ${ctx.state.accessToken}`;
        if (album.id) {
            const spotifyTracks = await searchTracksSingleAlbum(album.id, authString);
            if (!spotifyTracks)
                return undefined;
            if ('error' in spotifyTracks) {
                console.log('!spotifyTracks error -> ', spotifyTracks);
                return undefined;
            }
            const trackData = {
                album,
                tracks: spotifyTracks,
            };
            // TODO add to DB as we get the data one by one, otherwise the rate limit kills the request
            await ctx.services.mongo.spotify?.setSpotifyTrackData([{ album: trackData.album, tracks: trackData.tracks }]);
            return trackData;
        }
    }));
    console.log('!trackInfo -> ', allTracksInfo.filter(info => !!info));
    ctx.state.data = {
        spotifyTrackInfo: allTracksInfo.filter(info => !!info)
    };
    await next();
}
async function searchTracksSingleAlbum(albumId, authString) {
    console.log('!albumId, typeof albumId -> ', albumId, typeof albumId);
    const getTracksURL = `https://api.spotify.com/v1/albums/${albumId}/tracks`;
    const url = new URL(getTracksURL);
    try {
        const res = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${authString}`,
            },
        });
        if (!res)
            throw new Error("No response");
        const searchResults = await res.json();
        if (res.ok) {
            return searchResults;
        }
        if ('error' in searchResults) {
            return { error: searchResults };
        }
        throw new Error(`Error parsing response from URL: ${getTracksURL} res: ${JSON.stringify(res)} parsedRes: ${JSON.stringify(searchResults)}`);
    }
    catch (error) {
        throw error;
    }
}
