import { useState } from "react";
import { PlaylistRemoveIcon, LibraryAddIcon } from "../../../../../icons";
import { useAppState, useAppDispatch } from "../../../../../state/AppStateHooks";
import IconButton from "../../../../Shared/IconButton/IconButton";
import { DialogCreatePlaylist } from "../../components/DialogCreatePlaylist/DialogCreatePlaylist";
import { TracksCollectionStats } from "../../components/TracksCollectionStats/TracksCollectionStats";
import styles from './PlaylistComponents.module.css'
import Tooltip from "../../../../Shared/Tooltip/Tooltip";

export const HeaderPlaylistView = () => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  
  return (
    <div className={styles.headerPlaylistView}>
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
  const {user}  = useAppState()
  const isUserLoggedIn = !!user

  const handleOnClick = () => {
    setOpenDialog(true)
  }
  // TODO prob better to disable the button
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
