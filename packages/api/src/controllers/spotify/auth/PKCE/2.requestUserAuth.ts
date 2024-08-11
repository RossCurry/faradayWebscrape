// const redirectUrl = 'http://localhost:3000/callback'

import { REDIRECTS } from "../authRedirects.constants.js";

// TODO remove this
const client_id = 'e58f73ecd6fb4a228d3142621adfd1ab'
const tokenEndpoint = "https://accounts.spotify.com/api/token";

export async function getTokenPCKE(code: string, codeChallenge: string) {
  // const code_verifier = localStorage.getItem('code_verifier');

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