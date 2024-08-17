import React, { useEffect, useState } from 'react'
import './App.css'
import { SpotifySearchResult } from './types/spotify.types'
import styles from './app.module.css'

const baseUrlDev = 'http://localhost:3000'

const faradayLogo = 'https://images.squarespace-cdn.com/content/v1/5e944efc25a0ae61d8406414/1586777919218-AQWMGF2VNVFEKKX5NQBO/banderola+copia.jpg?format=1500w'

function App() {
  const [albumCollection, setAlbumCollection] = useState<SpotifySearchResult[] | null>(null)
  
  useEffect(() => {
    async function getAvailableAlbums(){
      
      const getAlbumsPath = '/api/faraday/albums'
      const response = await fetch(baseUrlDev + getAlbumsPath)
      if (response.ok){
        const jsonRes: SpotifySearchResult[] = await response.json()
        // TODO this should be sorted on the BE
        setAlbumCollection(jsonRes.filter(album => !!album?.name))
      }
    }
    getAvailableAlbums()
  }, [])

  return (
    <>
      <header>
        <a href="https://thisisfaraday.com" target="_blank">
          <img src={faradayLogo} className="logo" alt="Vite logo" />
        </a>
        <h1>Faraday Collection</h1>
      </header>
      <main>
        A collection of what is available on Spotify
        <section id='albumCollection'>
          <h2>grid section</h2>
          {albumCollection && <ul className={styles.albumCollectionList}>
            {albumCollection.map( (album, i) => {
              console.log('album', album)
              return <AlbumItem key={i + '-' + album.id} album={album}/>
              // return <li key={i + '-' + album.id} className={styles.albumItem}>{album.name}</li>
            })}
          </ul>}
        </section>
      </main>
      
    </>
  )
}

export default App

type AlbumItemProps = {
  album: SpotifySearchResult
}
function AlbumItem({ album }: AlbumItemProps) {
  const {image} = album
  if (!image || !image.url ) return null
  return (
    <li className={styles.albumItem} style={{ backgroundImage: `url(${image.url})` }}>
      <h3>{album.name}</h3>
      <h4>{album.artists.join(', ').trim()}</h4>
    </li>
  )
}