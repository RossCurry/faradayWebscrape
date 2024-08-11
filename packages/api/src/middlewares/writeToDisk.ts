import Application from "koa";
import path from "path"
import * as fs from "fs-extra"
import * as nodeFs from "fs"
import { fileURLToPath } from 'url';
import {  ProjectionResultsSingle } from "./getAlbumInfo.js";
import { AppContext } from "../router.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function writeToDisk(ctx: AppContext, next: Application.Next) {
  const searchResults = ctx.state.data.searchResults
  
  try {
    const dirPath = path.resolve("data/tmp")
    await fs.ensureDir(dirPath)
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