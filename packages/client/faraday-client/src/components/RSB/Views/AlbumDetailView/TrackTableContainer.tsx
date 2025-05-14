import { useMemo } from "react"
import { ArrowBackIcon } from "../../../../icons"
import { useAppDispatch, useAppState } from "../../../../state/AppStateHooks"
import { msToTimeDivision } from "../../../../utils/msToTime"
import IconButton from "../../../Shared/IconButton/IconButton"
import TrackTable from "../../Tables/Tracks/TrackTable"
import { Links } from "./Links"

import styles from './AlbumDetailView.module.css'

function TrackTableHeader() {
  const dispatch = useAppDispatch()
  const { openAlbumInfo } = useAppState().rsb

  const { albumInfo, trackList, albumId } = openAlbumInfo
  const imageUrl = trackList?.at(0)?.imageUrl
  const { hours, minutes, seconds } = useMemo(() => {
    const totalDurationMs = trackList?.reduce((duration, info) => info.duration_ms + duration, 0)
    return msToTimeDivision(totalDurationMs || 0)
  }, [trackList])
  const durationString = `${hours > 0 ? `${hours}h` : ''} ${minutes}m ${seconds}s`
  const albumLink = albumId && `https://open.spotify.com/album/${albumId}`


  const handleBackToAlbumView = () => {
    dispatch({
      type: 'updateView',
      view: 'albums',
      playlistId: null
    })
  }

  return (
    <header
      className={styles.trackTableHeader}
    >
      <IconButton
        handleOnClick={handleBackToAlbumView}
        Icon={ArrowBackIcon}
        text={''}
        className={styles.closeOverlayButton}
      />
      <div
        className={styles.trackTableHeaderImg}
        style={{
          backgroundImage: `url(${imageUrl})`
        }}
      >

      </div>
      {!!albumInfo?.isSoldOut && <div className={styles.albumItemSoldOut}>Sold out</div>}
      <div
        className={styles.trackTableHeaderAlbumInfo}
        style={{ position: 'relative'}}
      >
        <h2>{albumInfo?.name}</h2>
        <h3>{albumInfo?.artists.join(', ')}</h3>
      </div>

      <Links albumLink={albumLink} faradayLink={albumInfo?.link} isSoldOut={!!albumInfo?.isSoldOut} />
      <div
        className={styles.trackTableHeaderAlbumStats}
      >
        <p>{trackList?.length} track{trackList?.length === 1 ? '' : 's'}</p>
        <p>{durationString}</p>
      </div>
    </header>
  )
}

/**
 * Container for the tracklist view
 */
export function TrackTableContainer() {
  const { openAlbumInfo } = useAppState().rsb
  const { trackList, albumId } = openAlbumInfo


  const renderTrackList = !!albumId && !!trackList && trackList?.length > 0
  return (
    <section
      className={styles.trackTableContainer}
    >
      <TrackTableHeader />
      {renderTrackList &&
        <TrackTable
          data={trackList}
          // deselect the album selection if selected
          albumId={albumId}
        />
      }
    </section>
  )
}
