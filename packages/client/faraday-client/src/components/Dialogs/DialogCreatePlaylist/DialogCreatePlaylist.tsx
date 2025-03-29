import React, { useEffect, useState } from 'react'
import styles from './DialogCreatePlaylist.module.css'
import { useAppState } from '../../../state/AppStateHooks'
import { createPlaylist } from '../../../services/services'
import { ArrowBackIcon } from '../../../icons'
import IconButton from '../../Shared/IconButton/IconButton'
import { DialogPlaylistSuccess } from './Components/DialogPlaylistSuccess'
import { DialogPlaylistError } from './Components/DialogPlaylistError'
import { SendPlaylist } from './Components/SendPlaylist'

export function DialogCreatePlaylist({
  setOpenDialog,
  isDialogOpen
}: {
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>, isDialogOpen: boolean
}) {
  const { title, tracksCollection } = useAppState().playlist
  const dialogRef = React.useRef<HTMLDialogElement>(null)
  const [response, setResponse] = useState<'ok' | 'error' | null>(null)
  const [createdPlaylistUrl, setCreatedPlaylistUrl] = useState<string | null>(null)

  const handleOnClick = async () => {
    if (tracksCollection) {
      // TODO Loading state
      const playlistInfo = await createPlaylist(title, tracksCollection)
      if (playlistInfo) {
        console.log('!FE playlistInfo -> ', playlistInfo);
        setCreatedPlaylistUrl(playlistInfo.external_urls.spotify)
        setResponse('ok')
      } else {
        setResponse('error')
      }
    }
  }

  const handleOnCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleDialogUnmount = () => {
    setOpenDialog(false)
    setResponse(null)
  }
  // Open and close the dialog via parent state
  useEffect(() => {
    if (isDialogOpen) {
      dialogRef.current?.showModal()
    } else {
      dialogRef.current?.close()
    }
  }, [isDialogOpen])

  // Attach parent state setter to dialog close event
  useEffect(() => {
    const dialogVar = dialogRef.current;
    if (dialogVar) {
      dialogRef.current.addEventListener('close', handleDialogUnmount)
    }
    return () => {
      dialogVar?.removeEventListener('close', handleDialogUnmount)
    }
    // Only run on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialogCreatePlaylist}
    > <header className={styles.dialogHeader}>
        <IconButton
          handleOnClick={handleOnCloseDialog}
          Icon={ArrowBackIcon}
          text={'Back'}
          className={styles.closeDialogButton}
        />
        {!response && <h3>Add your playlist to Spotify</h3>}
      </header>
      <div className={styles.dialogContainer}>
        {!response && <SendPlaylist handleOnClick={handleOnClick} />}
        {response &&
          response === 'ok'
          ? <DialogPlaylistSuccess playlistUrl={createdPlaylistUrl} closeDialog={handleOnCloseDialog} />
          : response === 'error'
            ? <DialogPlaylistError />
            : null
        }
      </div>
    </dialog>
  )
}
