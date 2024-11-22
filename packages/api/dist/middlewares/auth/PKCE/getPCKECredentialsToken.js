import { getTokenPCKE } from "#controllers/spotify/auth/PKCE/2.requestUserAuth.js";
export default async function getPCKECredentialsToken(ctx, next) {
    const params = new URLSearchParams(ctx.querystring);
    const code = params.get('code');
    const codeChallenge = ctx.services.codeVerifier.get();
    if (!code || !codeChallenge)
        throw new Error('Missing code or codeChallenge from redirect');
    try {
        const token = await getTokenPCKE(code, codeChallenge);
        console.log('!getTokenPCKE response -> ', token);
        ctx.services.token.set(token);
        ctx.state.accessToken = token.access_token;
        await next();
    }
    catch (error) {
        ctx.body = { code };
    }
}
