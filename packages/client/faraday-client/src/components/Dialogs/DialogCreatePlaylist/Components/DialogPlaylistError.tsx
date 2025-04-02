import { ErrorIcon } from '../../../../icons'
import { ConnectToSpotifyButton } from '../../../Header/SpotifyConnect/Spotify'
import styles from './DialogComponent.module.css'

export function DialogPlaylistError({ errorMessage }: { errorMessage?: string }) {
  if (errorMessage) { console.error(errorMessage) }
  return (
    <section className={styles.dialogSection}>
      <div className={`
        ${styles.toastNotification}
        ${styles.errorMessage}
        `}>
        <ErrorIcon />
        <h3>Error</h3>
      </div>
      <p>Please try re-connecting to Spotify</p>
      <ConnectToSpotifyButton />
    </section>
  )
}