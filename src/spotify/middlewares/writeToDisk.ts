import Application from "koa";
import fetch from "node-fetch";
import queryString from "node:querystring"
import { isEmpty, uniqueId } from "lodash-es"
import path from "path"
import * as fs from "fs-extra"
import * as nodeFs from "fs"
import { randomUUID } from "crypto"
import { fileURLToPath } from 'url';
import { SearchResponse } from "../spotify.types.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function writeToDisk(ctx: Application.ParameterizedContext, next: Application.Next ) {
  const searchResults: SearchResponse = ctx.state.data.searchResults
  console.log('!__dirname -> ', __dirname);
  
  try {
    const dirPath = path.resolve("data/tmp")
    await fs.ensureDir(dirPath)
    // const filePath = path.resolve(dirPath, Date.now().toLocaleString() + randomUUID() + "-" + ".json")
    const filePath = path.resolve(dirPath, new Date(Date.now()).toISOString() + "-" + ".json")
    console.info('filePath', filePath)
    await nodeFs.writeFile(filePath, JSON.stringify(searchResults), {}, async (err, ) => {
      if (err) throw err;
      await fs.ensureFile(filePath)
      console.warn("File written to filePath: ", filePath)
    })
  } catch (error) {
    throw new Error(`Error writing Json to disk: ${error}`);
    
  }
  next()
}