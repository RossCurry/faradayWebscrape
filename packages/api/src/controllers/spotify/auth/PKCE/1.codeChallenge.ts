import { REDIRECTS } from "../authRedirects.constants.js";

const authorizationEndpoint = "https://accounts.spotify.com/authorize";
const scope = 'playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public';

/**
 * Code Challenge
 */
export async function redirectToSpotifyAuthorize() {
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
    client_id: process.env.CLIENT_ID as string,
    scope: scope,
    code_challenge_method: 'S256',
    code_challenge: code_challenge_base64,
    redirect_uri: REDIRECTS.redirect,
  };

  authUrl.search = new URLSearchParams(params).toString();
  return {authUrl, codeVerifier: code_verifier }; // Redirect the user to the authorization server for login
}