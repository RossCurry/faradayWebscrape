import React, { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppState } from '../../../../../state/AppStateHooks'
import styles from './DialogCreatePlaylist.module.css'
import { CheckCircleIcon, DoubleArrowIcon, EditIcon, PlaylistAddIcon } from '../../../../../icons'
import { createPlaylist } from '../../../../../services'
import IconButton from '../../../../Shared/IconButton/IconButton'
import { SpotifyGreenLogo } from '../../../../../logos'
import { FaradayLogo } from '../../../../../logos/FaradayLogo'
import IconButtonWithTooltip from '../../../../Shared/IconButtonWithTooltip/IconButtonWithTooltip'

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
        <h3>Add your playlist to Spotify</h3>
        <Logos />
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

function PlaylistTitle() {
  const ref = useRef<HTMLTextAreaElement>(null);
  const { title } = useAppState().playlist
  const dispatch = useAppDispatch()
  const playlistTitleId = `playlistTitle-${React.useId()}`
  const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch({ type: 'setNewPlaylistTitle', title: e.target.value })
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${e.target.scrollHeight - 20}px`;
    }
  }

  return (
    <section className={styles.playlistTitle}>
      <span className={styles.playlistTitleInputContainer}>
        <label htmlFor={playlistTitleId}>Playlist Title</label>
        <textarea
            rows={1}
            ref={ref}
            placeholder={title}
            value={title}
            maxLength={250}
            onChange={handleOnChange}
            className={styles.playlistTitleInput}
            id={playlistTitleId}
            required
          />
      </span>
      <EditIcon />
    </section>
  )
}

function Logos() {
  return (
    <section className={styles.logosContainer}>
      <FaradayLogo className={styles.faradaylogo} />
      <DoubleArrowIcon width={'100px'} height={'100px'} />
      <SpotifyGreenLogo width={'7em'} height={'7em'} />
    </section>
  )
}
