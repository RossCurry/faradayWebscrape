import React from 'react'
import styles from './header.module.css'
import SpotifyConnect from './SpotifyConnect/Spotify'
import { FaradayLogo } from '../../logos/FaradayLogo';

export default function Header() {

  return (
    <header className={styles.outerHeader}>
      <section className={styles.header}>
        <a href="https://thisisfaraday.com" target="_blank" rel="noopener noreferrer">
          <FaradayLogo className={styles.logo} />
        </a>
        <div className={styles.headerText}>
          <h1>Faraday Collection</h1>
          <p>A collection of what is available on Spotify</p>
        </div>
      </section>
      <SpotifyConnect />
  </header>
  )
}
