
/**
 * The auth here is for client credentails only
 * No user scoped requests can be made
 * like creating a playlist
 * https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow
 */

import Application from "koa"
import fetch from "node-fetch"
import dotenv from 'dotenv';
import Token, { AuthToken } from "../../../services/token/Token.js";
import { AppContext } from "../../../router.js";
dotenv.config();

const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET

const authHeaders = {
  'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
  'Content-Type': 'application/x-www-form-urlencoded'
}
const body = "grant_type=client_credentials"

const tokenEndpoint = "https://accounts.spotify.com/api/token"

export const userToken = new Token()

export async function getToken() {
  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      body: body,
      headers: authHeaders
    });
    if (!response.ok) throw Error(`something went wrong:  ${(await response.json().then(obj => console.log("obj", obj)))}`)

    const token = await response.json();
    return token as AuthToken
  } catch (error) {
    console.error(error)
    throw error
  }
}

/**
 * Gets client credential token for Spotiy read requests
 * @param ctx sets ctx.state.accessToken
 */
export default async function getClientCredentialToken(ctx: AppContext, next: Application.Next) {
  try {
    if (userToken.has()) {
      ctx.state.accessToken = userToken.get()
    } else {
      const token = await getToken()
      userToken.set(token)
      ctx.state.accessToken = token.access_token
    }
    console.log('!getTokenMw ctx.state.accessToken -> ', ctx.state.accessToken);
    await next()
  } catch (error) {
    throw error
  }
}