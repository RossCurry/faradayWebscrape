import { useState } from "react";
import { PlaylistRemoveIcon, LibraryAddIcon } from "../../../../../icons";
import { useAppState, useAppDispatch } from "../../../../../state/AppStateHooks";
import IconButton from "../../../../Shared/IconButton/IconButton";
import { TracksCollectionStats } from "../../Shared/TracksCollectionStats/TracksCollectionStats";
import styles from './PlaylistComponents.module.css'
import sharedStyles from '../../SharedStyles.module.css'
import Tooltip from "../../../../Shared/Tooltip/Tooltip";
import { DialogCreatePlaylist } from "../../../../Dialogs/DialogCreatePlaylist/DialogCreatePlaylist";

export const HeaderPlaylistView = ({playlistHasTracks}: {playlistHasTracks:boolean}) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  
  return (
    <header className={`
        ${sharedStyles.viewHeaderShared}
        ${styles.mobileHeaderGrid}
        ${!playlistHasTracks ? styles.centeredHeader : ''}
      `}>
      <span className={styles.headerResetButton}>
        <ResetPlaylistButton />
      </span>
      <span className={styles.headerStats}>
        <TracksCollectionStats />
      </span>
      <span className={styles.headerCreateButton}>
        <CreatePlaylistButton setOpenDialog={setIsDialogOpen} />
      </span>
      <DialogCreatePlaylist
        setOpenDialog={setIsDialogOpen}
        isDialogOpen={isDialogOpen}
      />
    </header>
  )
}

function ResetPlaylistButton() {
  const { tracksCollection } = useAppState().playlist
  const dispatch = useAppDispatch()
  const handleReset = () => {
    dispatch({ type: 'resetCustomPlaylist' })
    dispatch({ type: 'updateView', view: 'albums', playlistId: null })
  }
  if (!tracksCollection) return null
  return (
    <IconButton
      handleOnClick={handleReset}
      Icon={PlaylistRemoveIcon}
      text={'Reset Selection'}
      className={styles.resetButton}
    />
  )
}

export function CreatePlaylistButton({ setOpenDialog }: { setOpenDialog: React.Dispatch<React.SetStateAction<boolean>> }) {
  const { tracksCollection } = useAppState().playlist
  const {user}  = useAppState()
  const isUserLoggedIn = !!user

  const handleOnClick = () => {
    setOpenDialog(true)
  }
  
  if (!tracksCollection) return null
  return (
    <div>
      <Tooltip 
        Component={
            <IconButton 
            handleOnClick={handleOnClick} 
            Icon={LibraryAddIcon} 
            text={'Create Playlist'}
            className={`
              ${styles.createPlaylistButton}
              ${isUserLoggedIn ? '' : styles.disabledButton}
            `}
            disabled={!isUserLoggedIn}
          />
        }
        tooltipText={'You must be logged into Spotify to create a playlist'} 
        hideTooltip={isUserLoggedIn}
      />
    </div>
  )
}
