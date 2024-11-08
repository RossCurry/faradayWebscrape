import React, { useEffect, useState } from 'react'
import styles from './LeftSidebar.module.css'
import { SpotifyPlaylist } from '../../types/spotify.types'
import { getAvailablePlaylists } from '../../services'
import { faradayLogo } from '../Header/Header'
import { useAppDispatch, useAppState } from '../../state/AppStateHooks'

export default function LeftSidebar() {
  const [playlistCollection, setPalylistCollection] = useState<SpotifyPlaylist[] | null>(null)

  useEffect(() => {
    async function updateAlbums(){
      const availableAlbums = await getAvailablePlaylists()
      if (availableAlbums) setPalylistCollection(availableAlbums)
    }
    updateAlbums()
  }, [])
  return (
    <div id={'LeftSidebar'} className={styles.leftSidebar}>
        <section 
        id='playlistCollection' 
        className={styles.playlistContainer}
        >
          {/* <h2>grid section</h2> */}
          <ol className={styles.playlistCollection}>
            <PlaceholderItem />
            {playlistCollection?.map(playlist => {
              return (
                <PlaylistItem playlist={playlist} key={playlist.id}/>
              )
            })}
          </ol>
        </section>
    </div>
  )
}


export function PlaceholderItem() {
  const { newTitle } = useAppState().playlist
  const dispatch = useAppDispatch();
  const handleOnClick = () => {
    dispatch({
      type: 'updateView', view: 'playlist', playlistId: 'custom'
    })
  }
  return (
    <li className={styles.playlistItem} onClick={handleOnClick}>
      <img src={faradayLogo} className={styles.playlistItemImg} alt="Vite logo" />
      <div className={styles.playlistItemInfo}>
        <p>{newTitle}</p>
        <p style={{ fontSize: '.85rem' }}>{'Not logged in'}</p>
      </div>
    </li>
  )
}

export function PlaylistItem({playlist}: { playlist: SpotifyPlaylist}) {
  const smallestImage = playlist.images.at(-1)
  return (
    <li className={styles.playlistItem}>
      {smallestImage
       ? <span className={styles.playlistItemBgImg} style={{ backgroundImage: `url(${smallestImage.url})` }}></span>
       : <img src={faradayLogo} className={styles.playlistItemImg} alt="Vite logo" />
      }
      <div className={styles.playlistItemInfo}>
        <p>{playlist.name}</p>
        <p>{playlist.owner.id}</p>
      </div>
    </li>
  )
}
