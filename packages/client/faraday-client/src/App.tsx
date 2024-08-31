import React, { useEffect, useState } from 'react'

import './App.css'
import { SpotifySearchResult } from './types/spotify.types'
import styles from './app.module.css'
import { connectToSpoti, createPlaylist } from './services'
import { useParams, useSearchParams } from 'react-router-dom'

const baseUrlDev = 'http://localhost:3000'

const faradayLogo = 'https://images.squarespace-cdn.com/content/v1/5e944efc25a0ae61d8406414/1586777919218-AQWMGF2VNVFEKKX5NQBO/banderola+copia.jpg?format=1500w'

function App() {
  const placeholder = `Faraday ${new Date().toLocaleString('en-US', { month: 'long' })} ${new Date().toLocaleString('en-US', { year: 'numeric' })}`
  const [albumCollection, setAlbumCollection] = useState<SpotifySearchResult[] | null>(null)
  const [playlistTitle, setPlaylistTitle] = useState<string>('')
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code')
  console.log('code', code)
  
  useEffect(() => {
    async function getAvailableAlbums(){
      
      const getAlbumsPath = '/api/faraday/albums'
      const response = await fetch(baseUrlDev + getAlbumsPath)
      if (response.ok){
        const jsonRes: SpotifySearchResult[] = await response.json()
        const sortedOnFE = jsonRes.filter(album => !!album?.name)
        console.log('getAvailableAlbums: I no longer need sorting',jsonRes.length === sortedOnFE.length, jsonRes.length, sortedOnFE.length) 
        // TODO this should be sorted on the BE
        setAlbumCollection(sortedOnFE)
      }
    }
    getAvailableAlbums()
  }, [])

  return (
    <>
      <header>
        <a href="/">
          <img src={faradayLogo} className="logo" alt="Vite logo" />
        </a>
        <h1>Faraday Collection</h1>
      </header>
      <main>
        <p>A collection of what is available on Spotify</p>
        {!code && <button onClick={() => connectToSpoti()}>Connect to Spotify</button>}
        {code && <input type='text' value={playlistTitle} onChange={(e) => setPlaylistTitle(e.target.value)} placeholder={placeholder}/>}
        {code && <button onClick={() => createPlaylist(code, playlistTitle || placeholder)}>Create Playlist</button>}
        <section id='albumCollection'>
          <h2>grid section</h2>
          {albumCollection && <ul className={styles.albumCollectionList}>
            {albumCollection.map( (album, i) => {
              return <AlbumItem key={i + '-' + album.id} album={album}/>
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
      {album.isSoldOut && <div className={styles.albumItemSoldOut}></div>}
    </li>
  )
}