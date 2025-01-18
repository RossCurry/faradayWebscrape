import React, { useEffect, useMemo, useState } from 'react'
import styles from './Views.module.css'
import { useAppDispatch, useAppState } from '../../../state/AppStateHooks';
import AlbumTable from '../Tables/Albums/AlbumTable';
import { createPlaylist, getTracksByIds } from '../../../services';
import TrackTable from '../Tables/Tracks/TrackTable';
import { msToTime } from '../../../utils/msToTime';
import { CheckCircleIcon, EditIcon, LibraryAddIcon, PlaylistAddIcon, PlaylistRemoveIcon } from '../../../icons';
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

function DialogCreatePlaylist({
  setOpenDialog,
  isDialogOpen
}: {
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>, isDialogOpen: boolean
}) {
  const { title, tracksCollection } = useAppState().playlist
  const dialogRef = React.useRef<HTMLDialogElement>(null)

  const handleOnClick = async () => {
    if (tracksCollection) {
      // TODO Loading state
      const created = await createPlaylist(title, tracksCollection)
      if (created) {
        setOpenDialog(false)
      }
    }
  }
  // Open and close the dialog via parent state
  useEffect(() => {
    if (isDialogOpen) {
      dialogRef.current?.showModal()
    } else {
      dialogRef.current?.close()
    }
  },[isDialogOpen])
  
  // Attach parent state setter to dialog close event
  useEffect(() => {
    const dialogVar = dialogRef.current;
    if (dialogVar) {
      dialogRef.current.addEventListener('close', () => {
        setOpenDialog(false)
      })
    }
    return () => {
      dialogVar?.removeEventListener('close', () => {
        setOpenDialog(false)
      })
    }
    // Only run on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialogCreatePlaylist}
    > 
      <section className={styles.dialogContainer}>
        <h2>Add your playlist to Spotify</h2>
        <PlaylistTitle />
        <IconButton 
          handleOnClick={handleOnClick} 
          Icon={PlaylistAddIcon} 
          text={'Add Playlist'}
          className={styles.createPlaylistButton}
        />
      </section>
    </dialog>
  )
}


function HeaderAlbumView() {
  const { albumCollection } = useAppState()

  return (
    <header className={styles.headerAlbumView}>
      <p>Album collection size: {albumCollection?.length || 0}</p>
    </header>
  )
}

function TracksCollectionStats() {
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

const HeaderPlaylistView = () => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  console.log('!isDialogOpen -> ', isDialogOpen);
  
  return (
    <div className={styles.headerPlaylistView}>
      {/* <PlaylistTitle /> */}
      <TracksCollectionStats />
      <fieldset>
        <ResetPlaylistButton />
        <CreatePlaylistButton setOpenDialog={setIsDialogOpen} />
      </fieldset>
      <DialogCreatePlaylist
        setOpenDialog={setIsDialogOpen}
        isDialogOpen={isDialogOpen}
      />
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

function ResetPlaylistButton() {
  const dispatch = useAppDispatch()
  const handleReset = () => {
    dispatch({ type: 'resetCustomPlaylist' })
    dispatch({ type: 'updateView', view: 'albums', playlistId: null })
  }
  return (
    <IconButton
      handleOnClick={handleReset}
      Icon={PlaylistRemoveIcon}
      text={'Reset'}
    />
  )
}

export function CreatePlaylistButton({ setOpenDialog }: { setOpenDialog: React.Dispatch<React.SetStateAction<boolean>> }) {
  const { tracksCollection } = useAppState().playlist
  const handleOnClick = () => {
    setOpenDialog(true)
  }
  // TODO prob better to disable the button
  if (!tracksCollection) return null
  return (
    <div>
      <IconButton 
        handleOnClick={handleOnClick} 
        Icon={LibraryAddIcon} 
        text={'Create Playlist'}
        className={styles.createPlaylistButton}
      />
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