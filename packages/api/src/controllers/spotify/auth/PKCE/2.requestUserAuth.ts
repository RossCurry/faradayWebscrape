// const redirectUrl = 'http://localhost:3000/callback'
import dotenv from 'dotenv'
import { REDIRECTS } from "../authRedirects.constants.js";
dotenv.config()

export async function getTokenPCKE(code: string, codeChallenge: string) {
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