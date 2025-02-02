export default async function CreatePlaylist(ctx, next) {
    const params = new URLSearchParams(ctx.querystring);
    const playlistTitle = params.get('playlistTitle');
    const description = params.get('description');
    // const accessToken = ctx.services.token.get()
    const accessToken = ctx.services.token.getUserInfo()?.endpoint.access_token;
    const user_id = ctx.services.token.getUserInfo()?.id;
    console.log('!CreatePlaylist -> ', playlistTitle, accessToken, user_id);
    if (!accessToken)
        throw new Error('No accessToken found for spotify account');
    if (!user_id)
        throw new Error('No user id found for spotify account');
    const url = `https://api.spotify.com/v1/users/${user_id}/playlists`;
    const authString = `Bearer ${accessToken}`;
    const body = {
        "name": playlistTitle || `Faraday Agosto 2024 - new`,
        "description": description || "FaradayTest",
        "public": true
    };
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                Authorization: authString
            }
        });
        let jsonResponse;
        console.log('!CreatePlaylist parse response -> ', response);
        try {
            jsonResponse = await response.json();
        }
        catch (error) {
            throw error;
        }
        // if (!response.ok) throw Error(`something went wrong:  ${JSON.stringify(jsonResponse)}`)
        const spotifyPlaylist = jsonResponse;
        console.log('!spotifyPlaylist -> ', spotifyPlaylist);
        const userUri = ctx.services.token.getUserInfo()?.uri;
        if (!userUri)
            throw new Error('No user uri found for spotify account');
        ctx.services.mongo.setUsersPlaylist(userUri, spotifyPlaylist);
        // return spotifyPlaylist as SpotifyPlaylist
        ctx.state.playlist = spotifyPlaylist;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
    await next();
}
