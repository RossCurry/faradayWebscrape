import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import { connectToSpoti, createPlaylist } from '../../services';


export default function SpotifyConnect() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code')
  console.log('code', code)
  const [playlistTitle, setPlaylistTitle] = useState<string>('')


  const placeholder = `Faraday ${new Date().toLocaleString('en-US', { month: 'long' })} ${new Date().toLocaleString('en-US', { year: 'numeric' })}`

  return (
    <fieldset style={{ borderWidth: 0 }}>
      <p>A collection of what is available on Spotify</p>
      {!code && <button onClick={() => connectToSpoti()}>Connect to Spotify</button>}
      {code && <input type='text' value={playlistTitle} onChange={(e) => setPlaylistTitle(e.target.value)} placeholder={placeholder} />}
      {code && <button onClick={() => createPlaylist(code, playlistTitle || placeholder)}>Create Playlist</button>}
    </fieldset>
  )
}
