import { useState } from "react";
import { CheckCircleIcon, EditIcon, PlaylistRemoveIcon, LibraryAddIcon } from "../../../../../icons";
import { useAppState, useAppDispatch } from "../../../../../state/AppStateHooks";
import IconButton from "../../../../Shared/IconButton/IconButton";
import IconButtonWithTooltip from "../../../../Shared/IconButtonWithTooltip/IconButtonWithTooltip";
import { DialogCreatePlaylist } from "../../components/DialogCreatePlaylist/DialogCreatePlaylist";
import { TracksCollectionStats } from "../../components/TracksCollectionStats/TracksCollectionStats";
import styles from './PlaylistComponents.module.css'

export const HeaderPlaylistView = () => {
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

export function PlaylistTitle() {
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
