import React, { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppState } from '../../../../../state/AppStateHooks'
import styles from './DialogCreatePlaylist.module.css'
import { ArrowBackIcon, CheckCircleIcon, DoubleArrowIcon, EditIcon, ErrorIcon, PlaylistAddIcon } from '../../../../../icons'
import { connectToSpoti, createPlaylist } from '../../../../../services'
import IconButton from '../../../../Shared/IconButton/IconButton'
import { SpotifyGreenLogo } from '../../../../../logos'
import { FaradayLogo } from '../../../../../logos/FaradayLogo'

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
  },[isDialogOpen])
  
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
  },[])

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
        {!response && <SendPlaylist handleOnClick={handleOnClick}/>}
        {response && 
          response === 'ok' 
          ? <DialogPlaylistSuccess playlistUrl={createdPlaylistUrl} /> 
          : response === 'error' 
          ? <DialogPlaylistError /> 
          : null
        }
      </div>
    </dialog>
  )
}

function SendPlaylist({ handleOnClick: handleAddPlaylist }: { handleOnClick: () => void }) {
  return (
    <section className={styles.dialogSection}>
        <Logos />
        <PlaylistTitle />
        <IconButton 
          handleOnClick={handleAddPlaylist} 
          Icon={PlaylistAddIcon} 
          text={'Add Playlist'}
          className={styles.sendPlaylistButton}
        />
    </section>
  )
}

// TODO beautify these components
function DialogPlaylistSuccess({ playlistUrl }: { playlistUrl?: string | null }) {
  const handleOpenPlaylistInSpoti = () => {
    if (!playlistUrl) return
    window.open(playlistUrl, '_blank')
  }
  return (
    <section className={styles.dialogSection}>
      <div className={`
        ${styles.toastNotification}
        ${styles.successMessage}
        `}>
        <CheckCircleIcon />
        <h3>Success</h3>
      </div>
      {playlistUrl &&
      <>
        <p>Check out your new playlist</p>
        <button onClick={handleOpenPlaylistInSpoti}>Open in Spotify</button>
      </>
      }
    </section>
  )
}
function DialogPlaylistError({ errorMessage }: { errorMessage?: string }) {
  if (errorMessage) { console.error(errorMessage)}
  return (
    <section className={styles.dialogSection}>
      <div className={`
        ${styles.toastNotification}
        ${styles.errorMessage}
        `}>
        <ErrorIcon />
        <h3>Error</h3>
      </div>
      <p>Please try re-connecting to Spotify</p>
      <button onClick={() => connectToSpoti()}>Connect to Spotify</button>
    </section>
  )
}

function PlaylistTitle() {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [textAreaHasFocus, setTextAreaHasFocus] = useState(false);
  const { title } = useAppState().playlist
  const dispatch = useAppDispatch()
  const playlistTitleId = `playlistTitle-${React.useId()}`
  const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch({ type: 'setNewPlaylistTitle', title: e.target.value })
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${e.target.scrollHeight - 20}px`;
    }
  }

  console.log('!textAreaHasFocus -> ', textAreaHasFocus);
  const handleFocus = () => {
    console.log('!handlefocus -> ');
    setTextAreaHasFocus(true)
  }
  const handleBlur = () => {
    console.log('!handleBlur -> ');
    setTextAreaHasFocus(false)
  }

  useEffect(()=>{
    let ref: React.RefObject<HTMLTextAreaElement>['current'] | null = null;
    
    if (textAreaRef.current) {
      ref = textAreaRef.current
      textAreaRef.current?.addEventListener('focus', handleFocus)
      textAreaRef.current?.addEventListener('blur', handleBlur)
    }
    return () => {
      ref?.removeEventListener('focus', handleFocus)
      ref?.removeEventListener('blur', handleBlur)
      ref = null;
    }
  },[textAreaRef, textAreaHasFocus])

  return (
    <section className={styles.playlistTitle}>
      <span className={styles.playlistTitleInputContainer}>
        <label htmlFor={playlistTitleId}>Playlist Title</label>
        <textarea
            rows={1}
            ref={textAreaRef}
            placeholder={title}
            value={title}
            maxLength={250}
            onChange={handleOnChange}
            className={styles.playlistTitleInput}
            id={playlistTitleId}
            required
          />
      
        <div className={`
          ${styles.playlistTitleEditIcon} 
          ${textAreaHasFocus ? styles.hasFocus : ''}
          `}>
          <EditIcon  />
        </div>
      
      </span>
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
