import React, { useEffect, useState } from 'react'

import { SpotifySearchResult } from './types/spotify.types'
import styles from './app.module.css'
import { connectToSpoti, createPlaylist, getAvailableAlbums } from './services'
import { useSearchParams } from 'react-router-dom'
import AlbumTable from './components/Tables/Albums/AlbumTable'
import Header from './components/Header/Header'
import Spotify from './components/Spotify/Spotify'



function App() {
  const [albumCollection, setAlbumCollection] = useState<SpotifySearchResult[] | null>(null)

  const [searchParams] = useSearchParams();
  const code = searchParams.get('code')
  console.log('code', code)
  
  useEffect(() => {
    async function updateAlbums(){
      const availableAlbums = await getAvailableAlbums()
      if (availableAlbums) setAlbumCollection(availableAlbums)
    }
    updateAlbums()
  }, [])

  return (
    <>
      <Header />
      <main>
        <Spotify
          code={code}
          connectToSpoti={connectToSpoti}
          createPlaylist={createPlaylist}
        />
        <section id='albumCollection'>
          <h2>grid section</h2>
          {albumCollection &&
            <AlbumTable data={albumCollection} />
          }
        </section>
      </main>
      
    </>
  )
}

export default App
