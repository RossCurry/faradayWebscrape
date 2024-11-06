import React, { useEffect, useState } from 'react'

import styles from './RightSidebar.module.css'
import { SpotifySearchResult } from '../../types/spotify.types'
import { getAvailableAlbums } from '../../services'
import AlbumTable from './Tables/Albums/AlbumTable'

export default function RightSidebar() {
  const [albumCollection, setAlbumCollection] = useState<SpotifySearchResult[] | null>(null)

  useEffect(() => {
    async function updateAlbums(){
      const availableAlbums = await getAvailableAlbums()
      if (availableAlbums) setAlbumCollection(availableAlbums)
    }
    updateAlbums()
  }, [])
  return (
    <div
    className={styles.rightSidebar}
    >
      <main>
        <section id='albumCollection' className={styles.albumCollection}>
          {/* <h2>grid section</h2> */}
          {albumCollection &&
            <AlbumTable data={albumCollection} />
          }
        </section>
      </main>
    </div>
  )
}
