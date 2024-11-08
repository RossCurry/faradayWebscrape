import React, { useEffect, useMemo, useState } from 'react'
import styles from '../RightSidebar.module.css'
import { useAppDispatch, useAppState } from '../../../state/AppStateHooks';
import AlbumTable from '../Tables/Albums/AlbumTable';
import { getTracksByIds } from '../../../services';
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
  const { tracksCollection: tracks, newTitle } = useAppState().playlist
  const dispatch = useAppDispatch();
  const { custom } = useAppState().playlist
  const ids = useMemo(() => Object.keys(custom), [custom])

  useEffect(()=>{
    async function updateAlbums(){
      const tracksCollection = await getTracksByIds(ids)
      if (tracksCollection) dispatch({ type: 'setCustomTracksCollection', tracks: tracksCollection })
    }
    updateAlbums()
  // Only run on component mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  if (!tracks) return null;
  return (
    <section id='playlistView' className={styles.albumCollection}>
      <PlaylistTitle />
      <TrackTable 
        data={tracks}
        key={'playlist-table'}
      />
    </section>
  )
}


const PlaylistTitle = () => {
  const [editMode, setEditMode] = useState<boolean>(false)
  const { newTitle } = useAppState().playlist
  const dispatch = useAppDispatch()
  return (
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '1rem' }}>
      { editMode 
        ? <input type='text' value={newTitle} onChange={(e) => dispatch({ type: 'setNewPlaylistTitle', title: e.target.value })} style={{ fontSize: '1.4rem', fontWeight: '600', padding: '.25em .5em'}}/>
        : <h2 style={{ margin: 0 }}>{newTitle}</h2>
      }
      <button onClick={() => setEditMode(!editMode)}>{editMode ? 'done' : 'edit'}</button>
    </div>
  )
}