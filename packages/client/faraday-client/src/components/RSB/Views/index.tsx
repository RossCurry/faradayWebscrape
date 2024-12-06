import React, { useEffect, useMemo, useState } from 'react'
import styles from './Views.module.css'
import { useAppDispatch, useAppState } from '../../../state/AppStateHooks';
import AlbumTable from '../Tables/Albums/AlbumTable';
import { createPlaylist, getTracksByIds } from '../../../services';
import TrackTable from '../Tables/Tracks/TrackTable';

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
      {/* <h2>grid section</h2> */}
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
      const tracksCollection = await getTracksByIds(ids)
      if (tracksCollection) dispatch({ type: 'setCustomTracksCollection', tracks: tracksCollection })
      }
    if (ids.length) updateAlbums()
    dispatch({ type: 'setIsLoading', isLoading: true })
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
        <PlaylistTitle />
        
        <TrackTable
          data={tracks}
          key={'playlist-table'}
        />
        </>
      }
    </section>
  )
}


const PlaylistTitle = () => {
  const [editMode, setEditMode] = useState<boolean>(false)
  const { title } = useAppState().playlist
  const dispatch = useAppDispatch()
  return (
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '1rem' }}>
      <button onClick={() => setEditMode(!editMode)}>{editMode ? 'done' : 'edit'}</button>
      { editMode 
        ? <input type='text' value={title} onChange={(e) => dispatch({ type: 'setNewPlaylistTitle', title: e.target.value })} style={{ fontSize: '1.4rem', fontWeight: '600', padding: '.25em .5em'}}/>
        : <h2 style={{ margin: 0 }}>{title}</h2>
      }
      <CreatePlaylistButton />
    </div>
  )
}


export function CreatePlaylistButton() {
  const { title, tracksCollection } = useAppState().playlist
  
  // TODO prob better to disable the button
  if (!tracksCollection) return null
  return (
    <div>
      <button onClick={() => createPlaylist(title, tracksCollection)}>Create Playlist</button>
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