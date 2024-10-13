import React from 'react'
import styles from './header.module.css'
import SpotifyConnect from '../SpotifyConnect/Spotify'

const faradayLogo = 'https://images.squarespace-cdn.com/content/v1/5e944efc25a0ae61d8406414/1586777919218-AQWMGF2VNVFEKKX5NQBO/banderola+copia.jpg?format=1500w'

export default function Header() {
  return (
    <header className={styles.outerHeader}>
      <section className={styles.header}>
        <a href="/">
          <img src={faradayLogo} className="logo" alt="Vite logo" />
        </a>
        <h1>Faraday Collection</h1>
      </section>
      <SpotifyConnect />
  </header>
  )
}
