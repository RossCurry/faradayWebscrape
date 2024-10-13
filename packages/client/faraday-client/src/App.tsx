import React, { useEffect, useState } from 'react'

import { SpotifySearchResult } from './types/spotify.types'
import styles from './app.module.css'
import { getAvailableAlbums } from './services'
import AlbumTable from './components/Tables/Albums/AlbumTable'
import Header from './components/Header/Header'



function App() {
  const [albumCollection, setAlbumCollection] = useState<SpotifySearchResult[] | null>(null)


  
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
        <section id='albumCollection' className={styles.albumCollection}>
          {/* <h2>grid section</h2> */}
          {albumCollection &&
            <AlbumTable data={albumCollection} />
          }
        </section>
      </main>
      
    </>
  )
}

export default App
