import React from 'react'
import Player from './Player/Player'
import styles from './Footer.module.css'
import { useAppState } from '../../../state/AppStateHooks'
import TrackTable from '../Tables/Tracks/TrackTable'

export default function Footer() {
  // const { openAlbumInfo, tableContainerHeight } = useAppState().rsb
  // console.log('!tableContainerHeight -> ', tableContainerHeight);
  // const { trackList, albumId } = openAlbumInfo
  // const showTrackTable = !!albumId && trackList?.length
  return (
    <footer className={styles.footer}>
      {/* <section 
        className={`
          ${styles.trackTableContainer}
          ${showTrackTable ? styles.isOpen : styles.isClosed}
        `}
        style={{ 
          maxHeight: showTrackTable ? `${tableContainerHeight}px` : 0,
          minHeight: showTrackTable ? `${tableContainerHeight}px` : 0
        }}
      >
        {showTrackTable && 
          <TrackTable
            data={trackList}
            // deselect the album selection if selected
            albumId={albumId}
          />
        }
      </section> */}
      <Player />
    </footer>
  )
}
