/**
 * Adds data.faraday to ctx.state
 */
export default async function getFaradayStock(ctx, next) {
    console.log('!getFaradayStock -> ');
    try {
        const { mongo } = ctx.services;
        if (!mongo)
            throw new Error('No mongo object found');
        const faradayData = await mongo.getFaradayData();
        ctx.state.data.faraday = { cleanItems: faradayData };
        await next();
    }
    catch (error) {
        console.error('Error in middleware:', error);
        ctx.status = 500;
        ctx.body = 'Internal Server Error';
    }
}
