import Router from "koa-router";
// services
import MongoDB from '#services/mongodb/Mongo.js';
import CodeVerifier from '#services/codeVerifier/CodeVerifier.js';
import Token from '#services/token/Token.js';
import PreviewLinks from '#services/previewLinks/index.js';
// routers
import faradayRouter from '#controllers/faraday/index.js';
import spotifyRouter from '#controllers/spotify/index.js';
import userRouter from '#controllers/user/index.js';
import SpotifyApi from '#services/spotify/index.js';
function createServices() {
    console.log('!createServices -> ');
    // initialize services
    const services = {
        codeVerifier: new CodeVerifier(),
        mongo: new MongoDB(),
        token: new Token(),
        spotify: new SpotifyApi(),
        previewLinks: new PreviewLinks(),
    };
    return services;
}
// Inject dependencies
function createRouter({ services }) {
    const router = new Router();
    // Add services to the Context
    router.use((async (ctx, next) => {
        console.log('!Initialize data state -> ');
        console.log('!Add Services -> ');
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
export default router;
