import { REDIRECTS } from "#controllers/spotify/auth/authRedirects.constants.js";

class SpotifyApi {
  
  constructor(){
    console.log('!SpotifyApi  constructor-> ')
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
  
    return await response.json();
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
    return response;
  }
};

export default SpotifyApi;
