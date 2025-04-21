import { REDIRECTS } from "#controllers/spotify/auth/authRedirects.constants.js";
import { SpotifyPlaylist, SpotifyUserProfile } from "#controllers/spotify/spotify.types.js";
import { PKCE_ERROR_RES, PKCE_RES } from "#middlewares/auth/PKCE/getPCKECredentialsToken.js";
import { AuthToken } from "#services/token/Token.js";
import { getBatches } from "#utils/utils.js";

type SnapshotResponse = {
  snapshot_id: string
}

class SpotifyApi {

  constructor(){
    console.log('!SpotifyApi  constructor-> ')
  }

  async redirectToSpotifyAuthorize() {
    const client_id = process.env.CLIENT_ID
    if (!client_id) throw new Error('Missing env variable: CLIENT_ID');

    const authorizationEndpoint = "https://accounts.spotify.com/authorize";
    const scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomValues = crypto.getRandomValues(new Uint8Array(64));
    const randomString = randomValues.reduce((acc, x) => acc + possible[x % possible.length], "");

    const code_verifier = randomString;
    const data = new TextEncoder().encode(code_verifier);
    const hashed = await crypto.subtle.digest('SHA-256', data);

    const code_challenge_base64 = btoa(String.fromCharCode(...new Uint8Array(hashed)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    // window.localStorage.setItem('code_verifier', code_verifier);

    const authUrl = new URL(authorizationEndpoint)
    const params = {
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      code_challenge_method: 'S256',
      code_challenge: code_challenge_base64,
      redirect_uri: REDIRECTS.redirect,
    };

    authUrl.search = new URLSearchParams(params).toString();
    return {authUrl, codeVerifier: code_verifier }; // Redirect the user to the authorization server for login
  }

  async getTokenPCKE(code: string, codeChallenge: string) {
    const tokenEndpoint = "https://accounts.spotify.com/api/token";
    const client_id = process.env.CLIENT_ID
    if (!client_id) throw new Error('Missing env variable: CLIENT_ID');

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: client_id,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECTS.redirect, // not a real redirect, only used to verify the original redirect
        code_verifier: codeChallenge,
      }),
    });

    const spotiResponse: PKCE_RES | PKCE_ERROR_RES = await response.json();

    if ('error' in spotiResponse) {
      throw new Error(`Error getting token from Spotify API. Error: ${spotiResponse.error} message: ${spotiResponse.error_description}`)
    }

    return spotiResponse
  }

  async refreshToken(refreshToken: string){
    const tokenEndpoint = "https://accounts.spotify.com/api/token";
    const clientId = process.env.CLIENT_ID
    const clientSecret = process.env.CLIENT_SECRET
    if (!clientId || !clientSecret) throw new Error('Missing env variable: CLIENT_ID');

    const authHeaders = {
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }

    const body = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: authHeaders,
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }),
    });

    const response = await body.json();
    if ('error' in response) throw new Error('Error from spotify API', { cause: response })
    return response as AuthToken;
  }

  async createPlaylist({
      accessToken,
      userId,
      playlistTitle,
      description
    }: {
      accessToken: string,
      userId: string,
      playlistTitle: string,
      description: string
    }){

    const url = `https://api.spotify.com/v1/users/${userId}/playlists`
    const authString = `Bearer ${accessToken}`
    const body = {
      "name": playlistTitle || `Faraday Agosto 2024 - new`,
      "description": description || "FaradayTest",
      "public": true
    }
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          Authorization: authString
        }
      });

      let jsonResponse;
      try {
        jsonResponse = await response.json();
      } catch (error) {
        throw error
      }

      // Check for error property in response.
      // { error: { message: string, status: number } }
      if (jsonResponse && 'error' in jsonResponse){
        const err = JSON.stringify(jsonResponse)
        throw new Error(err)
      }

      return jsonResponse as SpotifyPlaylist
    } catch (error) {
      throw error
    }
  }

  /**
   * 100 max uris per request
   */
  async populatePlaylist({
    accessToken,
    playlistId,
    playlistTracks
  }:{
    accessToken: string,
    playlistId: string,
    playlistTracks: string[]
  }){

    const playlistEndpoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`
    let batches = [playlistTracks]
    if (playlistTracks.length > 100){
      batches = getBatches(playlistTracks, 100)
    }
    console.log('!batches.length -> ', batches.length);

    // This needs to be sequential for rate limiting reasons on SPotify API
    const snapshots: SnapshotResponse[] = []
    for await (const [i, uriBatch] of batches.entries()){

      // example data
      // uris: ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh","spotify:track:1301WleyT98MSxVHPZCA6M", "spotify:episode:512ojhOuo1ktJprKbVcKyQ"],
      const body = {
        uris: uriBatch,
        position: i === 0 ? 0 : i * 100
      }

      const authString = `Bearer ${accessToken}`
      try {
        const response = await fetch(playlistEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authString
          },
          body: JSON.stringify(body)
        })
        let responseBody = await response.json()
        const snapshot: SnapshotResponse = responseBody
        snapshots.push(snapshot)
      } catch (error) {
        throw error
      }
    }


  }

  async getUserInfo(accessToken: string){
    let justInCaseResponse;
    try {
        const authString = `Bearer ${accessToken}`
        const currentUserURL = 'https://api.spotify.com/v1/me'
        const response = await fetch(currentUserURL, {
          headers: {
            Authorization: authString
          }
        })
        justInCaseResponse = response
        const jsonResponse: SpotifyUserProfile = await response.json()
        return jsonResponse
      } catch (error) {
        if (error instanceof Error) {
          error.cause = justInCaseResponse
        }
        throw error
      }
  }


};

export default SpotifyApi;
