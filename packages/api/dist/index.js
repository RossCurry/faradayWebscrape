import Koa from "koa";
import logger from "koa-logger";
import json from "koa-json";
import cors from "koa-cors";
import bodyParser from "koa-bodyparser";
import url from "url";
import * as koaStatic from 'koa-static';
import path from 'node:path';
// router
import router from './router.js';
// env variables
import dotenv from 'dotenv';
dotenv.config();
const __dirname = url.fileURLToPath(new URL(import.meta.url));
const port = process.env.PORT || 4000;
if (!port)
    throw new Error("No port specified");
const app = new Koa();
// TODO need a relative solution for this
// Serve static files from the 'public' directory
const outputDir = '/Users/ross.curry/ross/faradayWebScrape/packages/api/dist';
app.use(koaStatic.default(path.join(outputDir, 'public')));
app.use(cors({
    // origin: process.env.PRODUCTION ? process.env.CLIENT_URL : "http://127.0.0.1:5500",
    origin: (ctx) => {
        const origin = ctx.req.headers.origin;
        console.log('!origin -> ', origin);
        // Allow requests from http://127.0.0.1:5500
        if (origin === 'http://rosscurry.dev' || origin === 'http://localhost:5173') {
            console.log('!returning origin -> ', origin);
            return origin;
        }
        // Or allow all origins (not recommended for production)
        return '*';
    },
    credentials: true, // Enable cookies to be sent,
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
    headers: ['Content-Type', 'Authorization'], // Specify allowed headers
    expose: ['location', 'Authorization', 'X-Updated-Jwt', 'X-Jwt-Remove'] // headers we expose in the response
}));
// app.use(cors())
app.use(bodyParser());
app.use(json());
app.use(logger());
app.use(router.routes());
app.use(router.allowedMethods());
try {
    app.listen(port, () => {
        console.log("__dirname", __dirname);
        console.log(`Koa connected on port: ${port} 🚀`);
    });
    app.on('error', err => {
        console.info('server error', err);
    });
}
catch (error) {
    console.error(error);
}
