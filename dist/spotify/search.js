// import fetch from "node-fetch";
// import queryString from "node:querystring"
import { isEmpty } from "lodash-es";
import path from "path";
// import * as fs from "fs-extra"
// import * as nodeFs from "fs"
// import { SearchResponse } from "../../types/search.js";
// import { randomUUID } from "crypto"
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const spotiBaseUrl = "https://api.spotify.com/v1/";
// const spotiUrl =  new URL(spotiBaseUrl)
/**
 * Type
 * Allowed values:"album""artist""playlist""track""show""episode""audiobook"
 * example: q=abacab&type=album,track
 * limit / market / offset
 *
 * eg: 'https://api.spotify.com/v1/search?type=album&include_external=audio'
 */
// const artist = "aphex twin"
// const  exampleQuery = queryString.parse(artist)
const type = "type=album";
// const type = "type=album,artist,track"
export async function search(ctx, _next) {
    try {
        console.log("ctx.query", ctx.request.query);
        if (isEmpty(ctx.request.query)) {
            ctx.response.status = 400;
            ctx.body = { message: "Bad request: No search terms" };
            return;
        }
        const { album, song } = ctx.request.query;
        if (!album)
            throw new Error("no search query");
        const searchTerm = Array.isArray(album) ? album.join(",") : album;
        const fullUrl = spotiBaseUrl + "search?" + "q=" + searchTerm + "&" + type;
        console.log('fullUrl', fullUrl);
        const authString = `Bearer ${ctx.state.token.access_token}`;
        const res = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${authString}`,
            },
        });
        if (!res)
            throw new Error("No response");
        if (res.ok) {
            const searchResults = await res.json();
            // console.log("search info", searchResults)
            // await writeSearchResultsToFile({ ...searchResults, searchTerm })
            // await triggerGithubAction()
            ctx.body = searchResults;
        }
        // ctx.body = album
    }
    catch (error) {
        throw new Error(`Res not OK: ${error}`);
    }
}
// async function writeSearchResultsToFile(searchResults: SearchResponse & { searchTerm: string }) {
//   try {
//     const dirPath = path.resolve("data/tmp")
//     await fs.ensureDir(dirPath)
//     const filePath = path.resolve(dirPath, randomUUID() + "-" + searchResults.searchTerm + ".json")
//     console.info('filePath', filePath)
//     await nodeFs.writeFile(filePath, JSON.stringify(searchResults), {}, async (err, ) => {
//       if (err) throw err;
//       await fs.ensureFile(filePath)
//       console.warn("File written to filePath: ", filePath)
//     })
//   } catch (error) {
//     throw new Error(`Error writing Json to disk: ${error}`);
//   }
// }
