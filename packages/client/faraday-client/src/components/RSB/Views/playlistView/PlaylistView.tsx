import { useMemo, useEffect } from "react";
import { getTracksByIds } from "../../../../services/services";
import { useAppState, useAppDispatch } from "../../../../state/AppStateHooks";
import TrackTable from "../../Tables/Tracks/TrackTable";
import styles from './PlaylistView.module.css'
import sharedStyles from '../SharedStyles.module.css'
import { HeaderPlaylistView } from "./components/PlaylistComponents";

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
    <section id='playlistView' className={sharedStyles.albumCollection}>
      {!showPlaylist && <PlaylistEmptyContainer />}
      {showPlaylist &&
        <div className={styles.playlistViewContainer}>
        <span 
          style={{ 
            gridArea: 'header', 
            position: 'sticky', 
            top: 0, 
            left: 0,
            zIndex: 'var(--z-3)'
          }}
        >
          <HeaderPlaylistView />
        </span>
        
        <span style={{ gridArea: 'playlist'}}>
          <TrackTable
            data={tracks}
            key={'playlist-table'}
          />
        </span>
        </div>
      }

    </section>
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
