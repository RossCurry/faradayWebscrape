import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import { connectToSpoti, createPlaylist } from '../../../services';
import { useAppState } from '../../../state/AppStateHooks';


export default function SpotifyConnect() {
  const { user } = useAppState()
  const isUserLoggedIn = !!user
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code')
  console.log('code', code)
  const [playlistTitle, setPlaylistTitle] = useState<string>('')


  const placeholder = `Faraday ${new Date().toLocaleString('en-US', { month: 'long' })} ${new Date().toLocaleString('en-US', { year: 'numeric' })}`

  console.log('!isUserLoggedIn -> ', isUserLoggedIn);
  return (
    <fieldset style={{ borderWidth: 0 }}>
      {!isUserLoggedIn 
      ? 
        <>
          <p>A collection of what is available on Spotify</p>
          <button onClick={() => connectToSpoti()}>Connect to Spotify</button>
        </>
      :
        <p>LoggedIn</p>
      }
      {/* TODO move playlist to playlist view */}
      {code && <input type='text' value={playlistTitle} onChange={(e) => setPlaylistTitle(e.target.value)} placeholder={placeholder} />}
      {code && <button onClick={() => createPlaylist(code, playlistTitle || placeholder)}>Create Playlist</button>}
    </fieldset>
  )
}
