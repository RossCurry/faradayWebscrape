import getItemData from '../../faraday/getItemData.js';
export default async function getFaradayStock(ctx, next) {
    const data = await getItemData();
    ctx.state.data = {
        faraday: data
    };
    next();
}
