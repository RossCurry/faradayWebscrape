import Koa from "koa"
import logger from "koa-logger"
import json from "koa-json"
import cors from "koa-cors";
import bodyParser from "koa-bodyparser"
import url from "url"
import * as koaStatic from 'koa-static';
import path from 'node:path'
// router
import router from './router.js';
// services
import CodeVerifier from "#controllers/spotify/auth/CodeVerifier.js";
import MongoDB from '#services/mongodb/index.js'
import Token from "#controllers/spotify/auth/Token.js";

// env variables
import dotenv from 'dotenv';
import Application from "koa";
dotenv.config();

const __dirname = url.fileURLToPath(new URL(import.meta.url))


const port = process.env.PORT || 4000
if (!port) throw new Error("No port specified");

const app = new Koa();

// Serve static files from the 'public' directory
const outputDir = '/Users/ross.curry/ross/faradayWebScrape/packages/api/dist'
// TODO need a relative solution for this
app.use(koaStatic.default(path.join(outputDir, 'public')));

app.use(cors({ 
  // origin: process.env.PRODUCTION ? process.env.CLIENT_URL : "http://127.0.0.1:5500",
  origin: (ctx) => {
    const origin = ctx.req.headers.origin;
    console.log('!origin -> ', origin, origin === 'http://127.0.0.1:5500');
    // Allow requests from http://127.0.0.1:5500
    if (origin === 'http://127.0.0.1:5500') {
      return origin;
    }
    // Or allow all origins (not recommended for production)
    return '*';
  },
  credentials: true, // Enable cookies to be sent,
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
  headers: ['Content-Type', 'Authorization'], // Specify allowed headers
  expose: ['location'] // headers we expose in the response
} ))
// app.use(cors())
app.use(router.routes())
app.use(router.allowedMethods())
app.use(bodyParser())
app.use(json())
app.use(logger())

// Some useful services for the app


try {
  app.listen(port, () => {
    console.log("__dirname", __dirname)
    console.log(`Koa connected on port: ${port} 🚀`)
  });
  app.on('error', err => {
    console.info('server error', err)
  });
} catch (error) {
  console.error(error)
}
