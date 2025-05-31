
import React, { useRef, useState, useEffect } from 'react';
import { PlaylistAddIcon, EditIcon, DoubleArrowIcon } from '../../../../icons';
import { SpotifyGreenLogo } from '../../../../logos';
import { FaradayLogo } from '../../../../logos/FaradayLogo';
import { useAppState, useAppDispatch } from '../../../../state/AppStateHooks';
import IconButton from '../../../Shared/IconButton/IconButton';
import styles from './DialogComponent.module.css'
import { useIsMobile } from '../../../../hooks/useIsMobile';

export function SendPlaylist({ handleOnClick: handleAddPlaylist }: { handleOnClick: () => void }) {
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


  useEffect(() => {
    const controller = new AbortController()
    if (textAreaRef.current) {
      textAreaRef.current?.addEventListener('focus', () => {
        setTextAreaHasFocus(true)
      }, { signal: controller.signal })
      textAreaRef.current?.addEventListener('blur', () => {
        setTextAreaHasFocus(false)
      },  { signal: controller.signal })
    }

    return () => {
      controller.abort()
    }
  }, [textAreaRef, textAreaHasFocus])

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
          <EditIcon />
        </div>

      </span>
    </section>
  )
}

function Logos() {
  const isMobile = useIsMobile()
  const logoSize = isMobile ? 75 : '7em'
  return (
    <section className={styles.logosContainer}>
      <FaradayLogo className={styles.faradaylogo} />
      <DoubleArrowIcon width={'100px'} height={'100px'} />
      <SpotifyGreenLogo width={logoSize} height={logoSize} />
    </section>
  )
}
