import Router from "koa-router";
// services
import MongoDB from '#services/mongodb/Mongo.js';
import CodeVerifier from '#services/codeVerifier/CodeVerifier.js';
import Token from '#services/token/Token.js';
// routers
import faradayRouter from '#controllers/faraday/index.js';
import spotifyRouter from '#controllers/spotify/index.js';
import userRouter from '#controllers/user/index.js';
import SpotifyApi from '#services/spotify/index.js';
// type App = Application<AppState, AppContext>
function createServices() {
    // initialize services
    const services = {
        codeVerifier: new CodeVerifier(),
        mongo: new MongoDB(),
        token: new Token(),
        spotify: new SpotifyApi(),
    };
    return services;
}
// Inject dependencies
function createRouter({ services }) {
    const router = new Router();
    // Add services to the Context
    router.use((async (ctx, next) => {
        console.log('!Initialize data state & add Services -> ');
        ctx.state.data = {};
        ctx.services = services;
        console.log('!Services added -> ', Object.keys(ctx.services));
        await next();
    }));
    return router;
}
const router = createRouter({
    services: createServices()
});
// TODO investigate more if this is best way to extend routes.
router.use(faradayRouter.routes(), faradayRouter.allowedMethods());
router.use(spotifyRouter.routes(), spotifyRouter.allowedMethods());
router.use(userRouter.routes(), userRouter.allowedMethods());
// router.get('/api/faraday/playlists', test)
// async function test(ctx: AppParamContext, _next: Application.Next) {
//   ctx.body = { foo: 'bar' }
// }
export default router;
