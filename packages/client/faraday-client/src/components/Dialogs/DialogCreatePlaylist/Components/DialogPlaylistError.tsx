import { ErrorIcon } from '../../../../icons'
import { connectToSpoti } from '../../../../services/services'
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
      <button onClick={() => connectToSpoti()}>Connect to Spotify</button>
    </section>
  )
}