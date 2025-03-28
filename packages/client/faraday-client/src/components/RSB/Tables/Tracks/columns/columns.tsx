import { AccessorColumnDef } from "@tanstack/react-table"
import styles from './columns.module.css'
import { TrackListColumnData } from "../TrackTable"
import Tooltip from "../../../../Shared/Tooltip/Tooltip"
import IconButton from "../../../../Shared/IconButton/IconButton"
import { LibraryAddIcon, LibraryRemoveIcon, PlayIconFilled } from "../../../../../icons"
import React, { useCallback } from "react"
import { useAppDispatch, useAppState } from "../../../../../state/AppStateHooks"


export const image: AccessorColumnDef<TrackListColumnData, { url: TrackListColumnData["imageUrl"] }> = {
  accessorFn: ({ imageUrl }) => {
    return {
      url: imageUrl,
    }
  },
  id: 'image',
  cell: info => {
    const { url } = info.getValue()
    return (
      <>
        <div
          className={styles.trackRowDataImg}
          style={{
            backgroundImage: `url(${url})`
          }}
        />
      </>
    )
  },
  header: () => null,
  enableSorting: false,
  size: 50,
  maxSize: 50,
}

export const songAndArtist: AccessorColumnDef<TrackListColumnData, TrackListColumnData> = {
  accessorFn: row => row,
  id: 'songInfo',
  cell: info => {
    const { name, artists } = info.getValue()
    const artist = artists.map(artist => artist.name).join(', ')
    const song = name
    return (
      <div className={styles.rowDataTrack}>
        <p>{song}</p>
        <p>{artist}</p>
      </div>
    )
  },
  header: () => null,
  // header: () => <span>Title</span>,
  sortingFn: (a, b) => {
    return a.original.name.localeCompare(b.original.name)
  },
  sortUndefined: 'last', //force undefined values to the end
  sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
}

export const title: AccessorColumnDef<TrackListColumnData, TrackListColumnData["name"]> = {
  accessorFn: row => row.name,
  id: 'title',
  cell: info => <span className={styles.rowDataTrack}>{info.getValue()}</span>,
  header: () => null,
  // header: () => <span>title</span>,
  sortUndefined: 'last', //force undefined values to the end
  sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
}

export const duration: AccessorColumnDef<TrackListColumnData, string> = {
  accessorFn: row => {
    const minutes = Math.floor(row.duration_ms / 60000); // 1 minute = 60000 row.duration_ms
    const seconds = Math.floor((row.duration_ms % 60000) / 1000); // Remaining seconds
    // Use padStart to ensure two digits for minutes and seconds
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
  
    return `${formattedMinutes}:${formattedSeconds}`;
    // return row.duration_ms
  },
  id: 'duration',
  cell: info => <span className={styles.rowDataTrack}>{info.getValue()}</span>,
  header: () => null,
  // header: () => <span>duration</span>,
  sortUndefined: 'last', //force undefined values to the end
  sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
}

export const artists: AccessorColumnDef<TrackListColumnData, TrackListColumnData["artists"][number]["name"][]> = {
  accessorFn: row => {
    const artistNames = row.artists.map(artist =>  artist.name)
    return artistNames
  },
  id: 'artists',
  cell: info => <span className={styles.rowDataTrack}>{info.getValue().join(', ')}</span>,
  header: () => null,
  // header: () => <span>artists</span>,
  sortUndefined: 'last', //force undefined values to the end
  sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
}

export const trackNumber: AccessorColumnDef<TrackListColumnData, TrackListColumnData["track_number"]> = {
  accessorFn: row => row.track_number,
  id: 'trackNumber',
  cell: info => <span className={styles.rowDataTrackNumber}>{info.getValue()}</span>,
  header: () => null,
  // header: () => <span className={styles.headerTrackNumber}>#</span>,
  sortUndefined: 'last', //force undefined values to the end
  sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
  size: 50
}

export const player: AccessorColumnDef<TrackListColumnData, TrackListColumnData["preview_url"]> = {
  accessorFn: row => row.preview_url,
  id: 'player',
  cell: info => {
    const playUrl = info.getValue()
    return (
      <audio controls >
        <source src={playUrl} type="audio/mpeg"/>
      </audio>
    )
  },
  header: () => null,
  sortUndefined: 'last', //force undefined values to the end
  sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
}


export const getCheckbox = ({
  areAllTracksSelected,
  allTracksIds
}: {
  areAllTracksSelected: boolean,
  allTracksIds: string[]
}) => {
  
  const checkBox: AccessorColumnDef<TrackListColumnData, { trackId: TrackListColumnData['id'], isChecked: boolean }> = {
    accessorFn: row => ({ trackId: row.id, isChecked: row.isChecked }),
    id: 'checkbox',
    cell: function TrackCell(info){
      const dispatch = useAppDispatch()
      const {trackId, isChecked} = info.getValue()

      const handleCheckbox = useCallback(() => (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value: trackId, checked } = e.target as HTMLInputElement
        if (checked){
          dispatch({ type: 'addTrackToCustomPlaylist', trackId: trackId })
        } else {
          dispatch({ type: 'deleteTrackFromCustomPlaylist', trackId: trackId })
        }
      }, [])
      
      return (
        <input
          className={styles.rowDataTrack}
          type="checkbox" 
          value={trackId} 
          checked={isChecked}
          onChange={handleCheckbox}
        />
      )
    },
    header: function TrackHeader(){
      const checkBoxId = `album-checkbox-select-all-id-${React.useId()}`
      const dispatch = useAppDispatch()

      const handleOnChangeHeader = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        console.log('!handleOnChangeHeader -> ', areAllTracksSelected, checked);
        if (checked){
          dispatch({ type: 'addTracksToCustomPlaylist', trackIds: allTracksIds })
        } else {
          dispatch({ type: 'deleteTracksFromCustomPlaylist', trackIds: allTracksIds })
        }
      },[])

      return (
        <label htmlFor={checkBoxId} className={styles.rowDataCentered}>
          <Tooltip 
            Component={areAllTracksSelected ? <LibraryRemoveIcon /> : <LibraryAddIcon />}
            tooltipText={areAllTracksSelected ? "Remove All" : "Select All"}
            position="right"
          />
          <input
            id={checkBoxId}
            className={styles.rowDataCheckbox}
            type="checkbox" 
            value={'all'} 
            checked={areAllTracksSelected}
            onChange={handleOnChangeHeader}
            style={{display: 'none'}}
          />
          </label>
      )
    },
    enableSorting: false
  }
  return checkBox
}

export const playButton: AccessorColumnDef<TrackListColumnData, TrackListColumnData> = {
  accessorFn: (data) => data || null,
  id: 'play',
  cell: function PlayButtonTracklist(info){
    const dispatch = useAppDispatch();
    const { audioUrl } = useAppState().player
    const id = React.useId()
    const track = info.getValue()
    const preview_url = track?.preview_url
    // TODO add isPlaying state from Player controls
    const isPlaying = audioUrl === preview_url;
    const isDisabled = !preview_url;

    return (
      <span className={styles.rowDataCentered} key={`tracklist-playbutton-${id}`}>
        <Tooltip 
          Component={
            <IconButton 
              Icon={PlayIconFilled}
              handleOnClick={(e) => { 
                e?.stopPropagation()
                dispatch({ type: 'setAudioUrl', track })
              }}
              text=""
              className={`
                ${styles.playButton}
                ${preview_url ? '' : styles.isDisabled}
                ${isPlaying ? styles.isPlaying : ''}
              `}
              disabled={isDisabled}
            />
          }
          tooltipText={'No preview available'}
          // TODO need to have a different approach to the tracklist. not overlay
          hideTooltip={true}
        />
      </span>
    )
  },
  header: () => null,
  enableSorting: false,
  // column size options
  // enableResizing: true // default
  size: 60
}
