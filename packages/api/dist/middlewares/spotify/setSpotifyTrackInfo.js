/**
 * Adds data.faraday to ctx.state
 */
export default async function setSpotifyTrackInfo(ctx, next) {
    console.log('!setSpotifyTrackInfo -> ');
    try {
        const { spotifyTrackInfo } = ctx.state.data;
        if (!spotifyTrackInfo)
            throw new Error('No SpotifyTrackInfo data found');
        const { mongo } = ctx.services;
        if (!mongo)
            throw new Error('No mongo object found');
        const inserted = await mongo.setSpotifyTrackData(spotifyTrackInfo);
        ctx.body = JSON.stringify(inserted);
        ctx.status = 200;
    }
    catch (error) {
        console.error('Error in middleware:', error);
        ctx.status = 500;
        ctx.body = 'Internal Server Error';
    }
    await next();
}
