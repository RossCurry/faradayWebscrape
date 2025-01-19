import React, { useEffect } from 'react'
import { useAppState } from '../../../../../state/AppStateHooks'
import styles from './DialogCreatePlaylist.module.css'
import { PlaylistAddIcon } from '../../../../../icons'
import { createPlaylist } from '../../../../../services'
import IconButton from '../../../../Shared/IconButton/IconButton'
import { PlaylistTitle } from '../../playlistView/components/PlaylistComponents'

export function DialogCreatePlaylist({
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