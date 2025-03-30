import { SpotifyTrackData } from "#controllers/spotify/spotify.types.js";
import { load as cherrioLoad } from "cheerio";


export default class PreviewLinks {
  constructor(){
    console.log('!PreviewLinks constructor -> ');
  }

  async searchByTracks(tracks: SpotifyTrackData[]){
    const results = await Promise.all(tracks.map(async (track) => {
      const spotifyUrl = track.external_urls.spotify;
      console.log('!spotifyUrl -> ', spotifyUrl);
      const previewUrls = await this.#getSpotifyLinks(spotifyUrl);
      
      return {
        name: `${track.name} - ${track.artists.map(artist => artist.name).join(', ')}`,
        trackId: track.id,
        spotifyUrl: spotifyUrl,
        previewUrls: previewUrls
      };
    }));
    return results
  }

  async #getSpotifyLinks(url: string){
    try {
      const response = await fetch(url);
      const parsedJson = await response.text()
      const html = parsedJson;
      const $ = cherrioLoad(html);
      const scdnLinks = new Set();
  
      $('*').each((_i, element: any) => {
        const attrs = element.attribs;
        Object.values(attrs).forEach(value => {
          if (value && typeof value === 'string' && value.includes('p.scdn.co')) {
            scdnLinks.add(value);
          }
        });
      });
  
      return Array.from(scdnLinks);
    } catch (error) {
      throw new Error(`Failed to fetch preview URLs: ${(error as Error)?.message}`);
    }
  }
}