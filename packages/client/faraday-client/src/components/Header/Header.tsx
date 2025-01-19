import React from 'react'
import styles from './header.module.css'
import SpotifyConnect from './SpotifyConnect/Spotify'
import { useAppDispatch } from '../../state/AppStateHooks'
import { FaradayLogo } from '../../logos/FaradayLogo';

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
          <FaradayLogo className={styles.logo} />
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
