import styles from './Player.module.css'
import { PlayerTrackImage, PlayerTrackDetails, PlayerControls } from './components';

export default function Player() {
  return (
    <div className={styles.player}>
      <PlayerTrackImage />
      <PlayerTrackDetails />
      <PlayerControls />
    </div>
  )
}




