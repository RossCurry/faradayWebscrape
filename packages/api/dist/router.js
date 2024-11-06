import Router from "koa-router";
// services
import MongoDB from '#services/mongodb/index.js';
import CodeVerifier from '#services/codeVerifier/CodeVerifier.js';
import Token from '#services/token/Token.js';
// routers
import faradayRouter from '#controllers/faraday/index.js';
import spotifyRouter from '#controllers/spotify/index.js';
// type App = Application<AppState, AppContext>
const services = {
    codeVerifier: new CodeVerifier(),
    mongo: new MongoDB(),
    token: new Token()
};
const router = new Router();
// initialize services
router.use((async (ctx, next) => {
    console.log('!initialize services -> ');
    ctx.state.data = {};
    ctx.services = services;
    await next();
}));
// TODO investigate more if this is best way to extend routes.
router.use(faradayRouter.routes(), faradayRouter.allowedMethods());
router.use(spotifyRouter.routes(), spotifyRouter.allowedMethods());
// router.get('/api/faraday/playlists', test)
// async function test(ctx: AppParamContext, _next: Application.Next) {
//   ctx.body = { foo: 'bar' }
// }
export default router;
