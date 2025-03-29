import { CheckCircleIcon } from "../../../../icons"
import styles from './DialogComponent.module.css'

export function DialogPlaylistSuccess({ 
  playlistUrl, 
  closeDialog 
}: { 
  playlistUrl?: string | null;
  closeDialog: () => void;
}) {
  const handleOpenPlaylistInSpoti = () => {
    if (!playlistUrl) return
    // open in spotify
    window.open(playlistUrl, '_blank')
    // close dialog
    closeDialog()
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