import React, { useCallback, useMemo } from "react"
import styles from '../columns.module.css'
import { LibraryRemoveIcon, LibraryAddIcon } from "../../../../../../../icons"
import Tooltip from "../../../../../../Shared/Tooltip/Tooltip"
import { useAppDispatch, useAppState } from "../../../../../../../state/AppStateHooks"

export function HeaderAlbumTableView() {
  const dispatch = useAppDispatch()
  const { areAllAlbumsSelected } = useAppState().rsb
  const checkBoxId = `album-checkbox-select-all-id-${React.useId()}`
  const { albumCollection } = useAppState()

  // List of all track ids
  const allTrackIds = useMemo(() => {
    const collection = albumCollection ? albumCollection : []
    return collection.reduce((tracks, album) => {
      const trackIds = album.trackList.map(track => track.id)
      return tracks.concat(trackIds)
    },[] as string[])
  }, [albumCollection])

  // Callback for Header Checkbox
    const handleSelectAll = useCallback((checkboxValue?: boolean) => {
      const addAll = !!checkboxValue
      // Modify playlist and checkbox selection
      if (addAll){
        // add all tracks to the custom playlist
        dispatch({type: 'addTracksToCustomPlaylist', trackIds: allTrackIds })
        dispatch({ type: 'selectAllAlbums' })
      } else {
        dispatch({ type: 'resetCustomPlaylist' })
        dispatch({ type: 'deselectAllAlbums' })
      }
      // Toggle
      dispatch({ type: 'setAllAlbumsSelected', areSelected: !areAllAlbumsSelected })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[allTrackIds, areAllAlbumsSelected])

  return (
    <label htmlFor={checkBoxId} className={styles.rowDataCentered}>
      <Tooltip 
        Component={areAllAlbumsSelected ? <LibraryRemoveIcon /> : <LibraryAddIcon />}
        tooltipText={areAllAlbumsSelected ? "Remove All" : "Select All"}
        position="right"
      />
      <input
        id={checkBoxId}
        className={styles.rowDataCheckbox}
        type="checkbox" 
        value={'all'} 
        checked={areAllAlbumsSelected}
        onChange={(e) => handleSelectAll(e.target.checked)}
        style={{display: 'none'}}
      />
      </label>
  )
}
