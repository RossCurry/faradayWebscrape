import React from 'react'
import styles from './header.module.css'
import SpotifyConnect from './SpotifyConnect/Spotify'
import { useAppDispatch } from '../../state/AppStateHooks'

export const faradayLogo = 'https://images.squarespace-cdn.com/content/v1/5e944efc25a0ae61d8406414/1586777919218-AQWMGF2VNVFEKKX5NQBO/banderola+copia.jpg?format=1500w'

export default function Header() {
  const dispatch = useAppDispatch();
  const handleOnClick = () => {
    dispatch({
      type: 'updateView', view: 'albums', playlistId: null
    })
  }
  return (
    <header className={styles.outerHeader}>
      <section className={styles.header}>
        <a href="/">
          <img src={faradayLogo} className={styles.logo} alt="Vite logo" />
        </a>
        <div className={styles.headerText}>
          <h1 onClick={handleOnClick}>Faraday Collection</h1>
          <p>A collection of what is available on Spotify</p>
        </div>
      </section>
      <SpotifyConnect />
  </header>
  )
}
