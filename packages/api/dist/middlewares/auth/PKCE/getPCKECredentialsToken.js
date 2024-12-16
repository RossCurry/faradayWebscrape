import { getTokenPCKE } from "#controllers/spotify/auth/PKCE/2.requestUserAuth.js";
export default async function getPCKECredentialsToken(ctx, next) {
    const params = new URLSearchParams(ctx.querystring);
    const code = params.get('code');
    const codeChallenge = ctx.services.codeVerifier.get();
    try {
        if (!code || !codeChallenge)
            throw new Error(`Missing code or codeChallenge from request: ${ctx.URL.toString()}`);
    }
    catch (error) {
        ctx.status = 400;
        throw error;
    }
    try {
        const token = await getTokenPCKE(code, codeChallenge);
        console.log('!getTokenPCKE response -> ', token);
        if ('error' in token)
            throw new Error(`Error getting token from Spotify API. Error: ${token.error} message: ${token.error_description}`);
        ctx.services.token.set(token);
        ctx.state.accessToken = token.access_token;
        await next();
    }
    catch (error) {
        ctx.body = { code };
        ctx.status = 500;
    }
}
