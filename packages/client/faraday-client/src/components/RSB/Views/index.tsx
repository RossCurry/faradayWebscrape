import React, { useEffect, useMemo, useState } from 'react'
import styles from './Views.module.css'
import { useAppDispatch, useAppState } from '../../../state/AppStateHooks';
import AlbumTable from '../Tables/Albums/AlbumTable';
import { createPlaylist, getTracksByIds } from '../../../services';
import TrackTable from '../Tables/Tracks/TrackTable';
import { msToTime } from '../../../utils/msToTime';
import { CheckCircleIcon, EditIcon } from '../../../icons';
import IconButton from '../../Shared/IconButton/IconButton';
import IconButtonWithTooltip from '../../Shared/IconButtonWithTooltip/IconButtonWithTooltip';

export default function Views() {
  const state = useAppState()
  const view = state.rsb.view
  switch (view) {
    case 'albums': {
      return ( <AlbumView />)
    }
    case 'playlist': {
      return (<PlaylistView />)
    }
    default: {
      return ( <AlbumView />)
    }
  }
}

export function AlbumView() {
  const { albumCollection } = useAppState()
  return (
    <section id='albumView' className={styles.albumCollection}>
      {/* TODO add statistic */}
      <HeaderAlbumView />
      {albumCollection &&
        <AlbumTable data={albumCollection} />
      }
    </section>
  )
}

export function PlaylistView() {
  const { tracksCollection: tracks } = useAppState().playlist
  const dispatch = useAppDispatch();
  const { custom } = useAppState().playlist
  const ids = useMemo(() => Object.keys(custom), [custom])
  const showPlaylist = tracks && tracks.length > 0;

  // Load data on mount
  // Dont call if nothing is selected
  useEffect(()=>{
    async function updateAlbums(){
      dispatch({ type: 'setIsLoading', isLoading: true })
      const tracksCollection = await getTracksByIds(ids)
      if (tracksCollection){ 
        dispatch({ type: 'setCustomTracksCollection', tracks: tracksCollection })
        dispatch({ type: 'setIsLoading', isLoading: false })
      }
      }
    if (ids.length) updateAlbums()
  // Only run on component mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  // set isLoading to false when we get the data
  useEffect(()=>{
    if (showPlaylist) dispatch({ type: 'setIsLoading', isLoading: false })
    // dispatch should not be in the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPlaylist])

  return (
    <section id='playlistView' className={styles.albumCollection}>
      {!showPlaylist && <PlaylistEmptyContainer />}
      {showPlaylist &&
        <>
        <HeaderPlaylistView />
        
        <TrackTable
          data={tracks}
          key={'playlist-table'}
        />
        </>
      }
    </section>
  )
}



function HeaderAlbumView() {
  const { albumCollection } = useAppState()
  const { tracksCollection } = useAppState().playlist
  const { hours, minutes, seconds } = useMemo( () => {
    const duration = tracksCollection?.reduce((sumOfDuration, track) => sumOfDuration + track.duration_ms, 0)
    return msToTime(duration || 0)
  }, [tracksCollection])

  
  
  return (
    <header className={styles.headerAlbumView}>
      <p>Album collection size: {albumCollection?.length}</p>
      <p>Tracks selected: {tracksCollection?.length}</p>
      <p>Total Duration: {hours}h {minutes}m {seconds}s</p>
    </header>
  )
 }

const HeaderPlaylistView = () => {

  return (
    <div className={styles.headerPlaylistView}>
      <PlaylistTitle />
      <CreatePlaylistButton />
    </div>
  )
}

function PlaylistTitle() {
  const [editMode, setEditMode] = useState<boolean>(false)
  const { title } = useAppState().playlist
  const dispatch = useAppDispatch()
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'setNewPlaylistTitle', title: e.target.value })
  }
  
  return (
    <section className={styles.playlistTitle}>
      { editMode 
        ? <input 
            type='text'
            value={title} 
            onChange={handleOnChange}
            className={styles.playlistTitleInput}
          />
        : <h3>{title}</h3>
      }
      <IconButtonWithTooltip
        handleOnClick={() => setEditMode(!editMode)}
        Icon={editMode ? CheckCircleIcon : EditIcon}
        text={editMode ? 'done' : 'edit'}
      />
    </section>
  )
}


export function CreatePlaylistButton() {
  const { title, tracksCollection } = useAppState().playlist
  
  // TODO prob better to disable the button
  if (!tracksCollection) return null
  return (
    <div>
      <button 
        onClick={() => createPlaylist(title, tracksCollection)}
        >Create Playlist
      </button>
    </div>
  )
}


const PlaylistEmptyContainer = () => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppState().playlist;
  return (
  <div className={styles.playlistEmptyContainer}>
    {isLoading && <div>isLoading</div>}
    {!isLoading && <div className={styles.playlistEmptyPlaceholder}>
      <p>No tracks selected for your playlist yet</p>
      <button
        onClick={() => dispatch({ type: 'updateView', view: 'albums', playlistId: null })}
      >
        Go to Collection
      </button>
    </div>}
  </div>
  )
}