export default async function getPCKECredentialsToken(ctx, next) {
    const params = new URLSearchParams(ctx.querystring);
    const code = params.get('code');
    const codeChallenge = ctx.services.codeVerifier.get();
    try {
        if (!code || !codeChallenge)
            throw new Error(`Missing code or codeChallenge from request: ${ctx.URL.toString()}`);
    }
    catch (error) {
        ctx.throw([400, error]);
    }
    try {
        // Get user token info from spotify
        const token = await ctx.services.spotify.getTokenPCKE(code, codeChallenge);
        // Set access token info in request state
        ctx.state.accessToken = token.access_token;
        ctx.state.spotifyUserToken = token;
    }
    catch (error) {
        ctx.throw([500, error]);
    }
    await next();
}
