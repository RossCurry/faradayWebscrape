import Application from "koa";
import path from "path"
import * as fs from "fs-extra"
import * as nodeFs from "fs"
import { fileURLToPath } from 'url';
import {  ProjectionResultsSingle } from "./getAlbumInfo.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function readFromDisk(ctx: Application.ParameterizedContext, next: Application.Next ) {
  // const searchResults: ProjectionResultsSingle = ctx.state.data.searchResults
  // Check the latest file only
  try {
    const dirPath = path.resolve("data/tmp")
    const filePaths = nodeFs.readdirSync(dirPath)
    const [latestFilePath] = filePaths.sort((a, b ) => {
      const dateA = new Date(a.slice(0, a.lastIndexOf('-')))
      const dateB = new Date(b.slice(0, b.lastIndexOf('-')))
      return  dateB.getMilliseconds() - dateA.getMilliseconds()
    })
    console.log('!files -> ', filePaths);
    console.log('!latestFile -> ', latestFilePath);
    const fullPath = path.resolve(dirPath,latestFilePath)
    const buffer = nodeFs.readFileSync(fullPath)
    const spotiAlbumInfo = JSON.parse(buffer.toString())
    ctx.state.data = {
      spotifyAlbumInfo: spotiAlbumInfo
    }
    // ctx.body = spotiAlbumInfo
    ctx.status = 200
    // await fs.ensureDir(dirPath)
    // const filePath = path.resolve(dirPath, new Date(Date.now()).toISOString() + "-" + ".json")
    // console.info('filePath', filePath)
    // await nodeFs.writeFile(filePath, JSON.stringify(searchResults), {}, async (err, ) => {
    //   if (err) throw err;
    //   await fs.ensureFile(filePath)
    //   console.warn("File written to filePath: ", filePath)
    // })
  } catch (error) {
    throw new Error(`Error reading Json from disk: ${error}`);
    
  }
  next()
}