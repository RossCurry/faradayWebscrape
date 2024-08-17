import getItemData from '#controllers/faraday/getItemData.js';
/**
 * Adds data.faraday to ctx.state
 */
export default async function scrapeFaradayStock(ctx, next) {
    const data = await getItemData();
    ctx.state.data = {
        faraday: data
    };
    next();
}
