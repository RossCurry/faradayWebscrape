// get user info
export default async function getCurrentUserFromSpotify(ctx, next) {
    try {
        const accessToken = ctx.services.token.get();
        const authString = `Bearer ${accessToken}`;
        const currentUserURL = 'https://api.spotify.com/v1/me';
        const response = await fetch(currentUserURL, {
            headers: {
                Authorization: authString
            }
        });
        const jsonResponse = await response.json();
        ctx.services.token.setUserInfo(jsonResponse);
        await ctx.services.mongo.setUserInfo(jsonResponse, ctx.services.token.getEndpointInfo());
    }
    catch (error) {
        throw error;
    }
    await next();
}
