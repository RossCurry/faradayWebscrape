export default async function CreatePlaylist(ctx, _next) {
    const user_id = 'freezealicious';
    const url = `https://api.spotify.com/v1/users/${user_id}/playlists`;
    const authString = `Bearer ${ctx.state.accessToken}`;
    const body = {
        "name": "FaradayTest",
        "description": "FaradayTest",
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
        if (!response.ok)
            throw Error(`something went wrong:  ${(await response.json().then(obj => console.log("obj", obj)))}`);
        const spotifyPlaylist = await response.json();
        console.log('!spotifyPlaylist -> ', spotifyPlaylist);
        return spotifyPlaylist;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
}
