import { CheckCircleIcon } from "../../../../icons"
import styles from './DialogComponent.module.css'

export function DialogPlaylistSuccess({ playlistUrl }: { playlistUrl?: string | null }) {
  const handleOpenPlaylistInSpoti = () => {
    if (!playlistUrl) return
    window.open(playlistUrl, '_blank')
  }
  return (
    <section className={styles.dialogSection}>
      <div className={`
        ${styles.toastNotification}
        ${styles.successMessage}
        `}>
        <CheckCircleIcon />
        <h3>Success</h3>
      </div>
      {playlistUrl &&
        <>
          <p>Check out your new playlist</p>
          <button onClick={handleOpenPlaylistInSpoti}>Open in Spotify</button>
        </>
      }
    </section>
  )
}