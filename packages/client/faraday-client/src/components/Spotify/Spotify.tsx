import React, { useState } from 'react'


type SpotifyProps = {
  code: string | null,
  connectToSpoti: () => void,
  createPlaylist: (code: string, title: string) => void,
}
export default function Spotify({
  code,
  connectToSpoti,
  createPlaylist,
}: SpotifyProps) {
  const [playlistTitle, setPlaylistTitle] = useState<string>('')
  
  const placeholder = `Faraday ${new Date().toLocaleString('en-US', { month: 'long' })} ${new Date().toLocaleString('en-US', { year: 'numeric' })}`
  
  return (
    <fieldset>
      <p>A collection of what is available on Spotify</p>
      {!code && <button onClick={() => connectToSpoti()}>Connect to Spotify</button>}
      {code && <input type='text' value={playlistTitle} onChange={(e) => setPlaylistTitle(e.target.value)} placeholder={placeholder}/>}
      {code && <button onClick={() => createPlaylist(code, playlistTitle || placeholder)}>Create Playlist</button>}
    </fieldset>
  )
}
