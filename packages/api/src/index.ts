import Koa from "koa"
import logger from "koa-logger"
import json from "koa-json"
import router from './router.js';
import cors from "koa-cors";
import bodyParser from "koa-bodyparser"
import url from "url"
import dotenv from 'dotenv';
dotenv.config();

const __dirname = url.fileURLToPath(new URL(import.meta.url))


const port = process.env.PORT || 4000
if (!port) throw new Error("No port specified");

const app = new Koa();

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
  expose: ['location']
} ))
// app.use(cors())
app.use(router.routes())
app.use(router.allowedMethods())
app.use(bodyParser())
app.use(json())
app.use(logger())

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

export default router;
