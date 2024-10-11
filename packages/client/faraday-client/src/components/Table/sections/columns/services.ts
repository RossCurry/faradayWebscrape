import { baseUrlDev } from "../../../../App"

export async function getTrackList(albumId: string) {
  const getTracksPath = `/api/spotify/album/${albumId}/tracks`
      const response = await fetch(baseUrlDev + getTracksPath)
      if (response.ok){
        const jsonRes = await response.json()
        console.log('!jsonRes -> ', jsonRes);
        const { tracklist } = jsonRes;
        return tracklist.items
      }
}