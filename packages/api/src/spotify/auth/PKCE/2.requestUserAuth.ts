const redirectUrl = 'http://localhost:3000/callback'
// TODO remove this
const client_id = 'e58f73ecd6fb4a228d3142621adfd1ab'
const tokenEndpoint = "https://accounts.spotify.com/api/token";

export async function getToken(code: string) {
  const code_verifier = localStorage.getItem('code_verifier');

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: client_id,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUrl,
      code_verifier: code_verifier || '',
    }),
  });

  return await response.json();
}