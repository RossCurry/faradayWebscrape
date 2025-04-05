import { ShoppingCartIcon, OpenInNew } from "../../../../icons";
import { SpotifyGreenLogo } from "../../../../logos";

import styles from './AlbumDetailView.module.css'

/**
 * External links for album detail view
 * 
 * For some reason the tooltip component doesnt anchor correctly here
 */
export function Links({ 
  albumLink, 
  faradayLink,
  isSoldOut,
}: { 
  albumLink: string | null,
  faradayLink?: string,
  isSoldOut: boolean,
}){
  return (
    <span
      className={styles.trackTableHeaderLinks}
    >
    {faradayLink && 
    <a 
      href={faradayLink} 
      target='_blank'
    >
      {/* tooltipText='Buy on Faraday' */}
      {!isSoldOut ? <ShoppingCartIcon width={28} height={28} /> : <OpenInNew />}
    </a>
    }
    {albumLink && 
      <a 
        href={albumLink} 
        target='_blank'
      >
        {/* tooltipText='Listen on Spotify' */}
        <SpotifyGreenLogo width={28} height={28} />
      </a>
      }
    </span>
  )
}