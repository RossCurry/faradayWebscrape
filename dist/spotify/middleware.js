import fetch from "node-fetch";
import dotenv from 'dotenv';
import Token from "./Token.js";
dotenv.config();
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const authHeaders = {
    'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    'Content-Type': 'application/x-www-form-urlencoded'
};
const body = "grant_type=client_credentials";
const tokenEndpoint = "https://accounts.spotify.com/api/token";
const userToken = new Token();
export async function getToken() {
    try {
        console.log('!authHeaders -> ', authHeaders);
        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            body: body,
            headers: authHeaders
        });
        if (!response.ok)
            throw Error(`something went wrong:  ${(await response.json().then(obj => console.log("obj", obj)))}`);
        const token = await response.json();
        return token;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
}
// getToken().then(res => console.log("res", res)).catch((e)=>{console.error(e)})
export async function getTokenMw(ctx, next) {
    try {
        // if (userToken.has()){
        if (false) {
            ctx.state.accessToken = userToken.get();
        }
        else {
            const token = await getToken();
            userToken.set(token);
            console.log('!token.access_token -> ', token.access_token);
            ctx.state.accessToken = token.access_token;
        }
        await next();
    }
    catch (error) {
        throw error;
    }
}
