import { useMemo } from "react"
import { useAppState } from "../../../../../state/AppStateHooks"
import { msToTime } from "../../../../../utils/msToTime"
import styles from './TracksCollectionStats.module.css'

export function TracksCollectionStats() {
  // TODO move stat logic to state
    const { tracksCollection } = useAppState().playlist
    const { hours, minutes, seconds } = useMemo( () => {
      const duration = tracksCollection?.reduce((sumOfDuration, track) => sumOfDuration + track.duration_ms, 0)
      return msToTime(duration || 0)
    }, [tracksCollection])
    const durationString = `${hours > 0 ? `${hours}h` : ''} ${minutes}m ${seconds}s`
    return (
      <div className={styles.tracksCollectionStats}>
        <p>Tracks selected: {tracksCollection?.length || 0}</p>
        <p>Total Duration: {durationString}</p>
      </div>
    )
  }