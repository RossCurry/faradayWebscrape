import { 
  createContext, 
  ReactNode, 
  useReducer, 
  Dispatch,
} from 'react';
import { CONSTANTS, Views } from './constants';
import { SpotifySearchResult, SpotifyUserProfile } from '../types/spotify.types';
import { TrackListData } from '../components/RSB/Tables/Tracks/TrackTable';
import { AlbumItemTableData, CheckedAlbumDict, CheckedTrackDict } from '../components/RSB/Tables/Albums/AlbumTableContainer';
import { getLocalStorageAreAllAlbumsSelected, getLocalStoragePlaylist, getLocalStorageSelectedAlbums, updateLocalStoragePlaylist, updateLocalStorageSelectedAlbums } from '../utils/localStorage';
import { Filter } from '../types/app.types';

type AppState = {
  albumCollection: SpotifySearchResult[] | null,
  playlist: {
    custom: CheckedTrackDict,
    selectedPlaylistId: string | null,
    tracksCollection: SpotifySearchResult["trackList"] | null,
    title: string,
    isLoading: boolean
  },
  rsb: {
    view: Views,
    selectedAlbums: CheckedAlbumDict
    areAllAlbumsSelected: boolean
    scrollAction: 'fetch' | null
    scrollElement: HTMLElement | null
    scrollToTop: number
    shouldScroll: boolean
    showTrackTableOverlay: boolean
    openAlbumInfo: {
      trackList: TrackListData[] | null,
      albumId: string | null
      albumInfo: AlbumItemTableData | null
    }
    tableContainerHeight: number
    filters: {
      availability: Filter['availability']
    },
    totalCollectionCount: number
  },
  player: {
    audioRef: React.RefObject<HTMLAudioElement> | null,
    audioUrl: string | null,
    track: TrackListData | null,
    controls : {
      isPlaying: boolean,
      isPaused: boolean,
      isMuted: boolean,
      volume: number,
      playbackRate: number,
      clipDuration: number
    }
  }
  user: SpotifyUserProfile | null
};

const playlistPlaceholderTitle = `Faraday ${new Date().toLocaleString('en-US', { month: 'long' })} ${new Date().toLocaleString('en-US', { year: 'numeric' })}`

const initialAppState: AppState = {
  // TODO check we still use the albumCollection
  albumCollection: [],
  playlist: {
    custom: getLocalStoragePlaylist(),
    selectedPlaylistId: null,
    tracksCollection: null,
    title: playlistPlaceholderTitle,
    isLoading: false,
  },
  rsb: {
    view: CONSTANTS.views.albums,
    selectedAlbums: getLocalStorageSelectedAlbums() || {},
    areAllAlbumsSelected: getLocalStorageAreAllAlbumsSelected() || false,
    scrollAction: null,
    scrollElement: null,
    scrollToTop: 0,
    shouldScroll: true,
    showTrackTableOverlay: false,
    openAlbumInfo: {
      trackList: null,
      albumId: null,
      albumInfo: null
    },
    tableContainerHeight: 0,
    filters: {
      availability: 'available'
    },
    totalCollectionCount: 0
  },
  player: {
    audioRef: null,
    audioUrl: null,
    track: null,
    controls: {
      isPlaying: false,
      isPaused: false,
      isMuted: false,
      volume: 1,
      playbackRate: 1,
      clipDuration: 0
    }
  },
  user: null
}

export type ActionTypes = 
// Playlist
| { type: 'addTrackToCustomPlaylist', trackId: string }
| { type: 'deleteTrackFromCustomPlaylist', trackId: string }
| { type: 'addTracksToCustomPlaylist', trackIds: string[] }
| { type: 'deleteTracksFromCustomPlaylist', trackIds: string[] }
| { type: 'resetCustomPlaylist' }
| { type: 'setCustomTracksCollection', tracks: SpotifySearchResult["trackList"] | null }
| { type: 'setNewPlaylistTitle', title: string }
| { type: 'setIsLoading', isLoading: boolean }
// RSB Views
| { type: 'updateView', view: Views, playlistId: string | null }
| { type: 'addSelectedAlbum', albumId: string }
| { type: 'deleteSelectedAlbum', albumId: string }
| { type: 'selectAllAlbums' }
| { type: 'deselectAllAlbums' }
| { type: 'setAllAlbumsSelected', areSelected: boolean }
| { type: 'scrollAction', scrollAction: 'fetch' | null }
| { type: 'setScrollElement', scrollElement: HTMLElement | null }
| { type: 'setOpenAlbumInfo', openAlbumInfo: AppState['rsb']['openAlbumInfo'] }
| { type: 'setTableContainerHeight', tableContainerHeight: AppState['rsb']['tableContainerHeight'] }
| { type: 'setShowTrackTableOverlay', showTrackTableOverlay: AppState['rsb']['showTrackTableOverlay'] }
| { type: 'setScrollToTop', scrollToTop: AppState['rsb']['scrollToTop'] }
| { type: 'setShouldScroll', shouldScroll: AppState['rsb']['shouldScroll'] }
| { type: 'setFilters', filters: AppState['rsb']['filters'] }
| { type: 'setTotalCollectionCount', totalCollectionCount: AppState['rsb']['totalCollectionCount'] }
// Main album collection
| { type: 'setAlbumCollection', albums: SpotifySearchResult[] | null }
// Player
| { type: 'setAudioRef', audioRef: AppState['player']['audioRef'] }
| { type: 'setAudioUrl', track: TrackListData | null }
| { type: 'setControls', controls: Partial<AppState['player']['controls']> }
// User
| { type: 'setUserInfo', userInfo: SpotifyUserProfile | null }

export type AppStateDispatch = Dispatch<ActionTypes>;

export const AppStateContext = createContext<AppState>(initialAppState);
export const AppStateDispatchContext = createContext<AppStateDispatch>(() => {});

function stateReducer(state: AppState, action: ActionTypes) {
  switch (action.type) {
    case 'addTrackToCustomPlaylist': {
      const updatedList = {
        ...state.playlist.custom,
        [action.trackId]: true,
      }

      // Quick and dirty local storage solution
      updateLocalStoragePlaylist(updatedList)

      return { 
        ...state, 
        playlist: { ...state.playlist, custom: updatedList } 
      };
    }
    case 'deleteTrackFromCustomPlaylist': {
      const playlist = { ...state.playlist.custom };
      delete playlist[action.trackId];

      // Quick and dirty local storage solution
      updateLocalStoragePlaylist(playlist)

      return { 
        ...state, 
        playlist: { ...state.playlist, custom: playlist } 
      };
    }
    case 'addTracksToCustomPlaylist': {
      const playlist = { ...state.playlist.custom };
      action.trackIds.forEach( trackId => {
        playlist[trackId] = true;
      })

      // Quick and dirty local storage solution
      updateLocalStoragePlaylist(playlist)

      return { 
        ...state, 
        playlist: { ...state.playlist, custom: playlist } 
      };
    }
    case 'deleteTracksFromCustomPlaylist': {
      const playlist = { ...state.playlist.custom };
      action.trackIds.forEach( trackId => {
        delete playlist[trackId];
      })

      // Quick and dirty local storage solution
      updateLocalStoragePlaylist(playlist)

      return { 
        ...state, 
        playlist: { ...state.playlist, custom: playlist } 
      };
    }
    case 'resetCustomPlaylist': {
      const areAllAlbumsSelected = false
      // Quick and dirty local storage solution
      updateLocalStoragePlaylist(null)
      updateLocalStorageSelectedAlbums(null, areAllAlbumsSelected)

      return { 
        ...state, 
        playlist: { 
          ...state.playlist, 
          custom: {}, 
          tracksCollection: null 
        },
        rsb: { ...state.rsb, 
          selectedAlbums: {}, 
          areAllAlbumsSelected 
        }
      };
    }
    case 'setCustomTracksCollection': {
      return { 
        ...state,
        playlist: { ...state.playlist, tracksCollection: action.tracks }
      }
    }
    case 'setNewPlaylistTitle': {
      return {
        ...state,
        playlist: { ...state.playlist, title: action.title }
      }
    }
    case 'setIsLoading': {
      return {
        ...state,
        playlist: { ...state.playlist, isLoading: action.isLoading }
      }
    }
    // RSB Reducers
    case 'updateView': {
      return { 
        ...state,
        playlist: { ...state.playlist, selectedPlaylist: action.playlistId },
        rsb: { ...state.rsb, view: action.view } 
      };
    }
    case 'addSelectedAlbum': {
      // TODO This shuold work but its off by 1 less
      const selectedAlbumsCount = Object.keys(state.rsb.selectedAlbums).length + 1
      const fullCollectionCount = state.rsb.totalCollectionCount
      const setAllAlbumsSelected = (selectedAlbumsCount === fullCollectionCount)
      const updatedAlbums = { ...state.rsb.selectedAlbums, [action.albumId]: true }

      // Quick and dirty localStorage
      updateLocalStorageSelectedAlbums(updatedAlbums, setAllAlbumsSelected)

      return { 
        ...state,
        rsb: { 
          ...state.rsb, 
          selectedAlbums: updatedAlbums,
          areAllAlbumsSelected: setAllAlbumsSelected
        } 
      };
    }
    case 'deleteSelectedAlbum': {
      const copy = { ...state.rsb.selectedAlbums }
      delete copy[action.albumId]

      // Quick and dirty localStorage
      updateLocalStorageSelectedAlbums(copy, state.rsb.areAllAlbumsSelected)

      return { 
        ...state,
        rsb: { ...state.rsb, selectedAlbums: copy }
      };
    }
    case 'selectAllAlbums': {
      const allSelected = (state.albumCollection || []).reduce((selection, album) => {
        selection[album.id] = true;
        return selection
      }, {} as Record<SpotifySearchResult['id'], boolean>)
      const areAllAlbumsSelected = true
      // Quick and dirty localStorage
      updateLocalStorageSelectedAlbums(allSelected, areAllAlbumsSelected)

      return { 
        ...state,
        rsb: { ...state.rsb, selectedAlbums: allSelected, areAllAlbumsSelected } 
      };
    }
    case 'deselectAllAlbums': {
      const areAllAlbumsSelected = false
      // Quick and dirty localStorage
      updateLocalStorageSelectedAlbums(null, areAllAlbumsSelected)

      return { 
        ...state,
        rsb: { ...state.rsb, selectedAlbums: {}, areAllAlbumsSelected } 
      };
    }
    case 'setAllAlbumsSelected': {
      const { areSelected } = action;
      // Quick and dirty localStorage
      updateLocalStorageSelectedAlbums(state.rsb.selectedAlbums, areSelected)

      return { 
        ...state,
        rsb: { ...state.rsb, areAllAlbumsSelected: areSelected } 
      }; 
    }
    // TODO might need to remove these
    case 'scrollAction': {
      const { scrollAction } = action;
      return { 
        ...state,
        rsb: { ...state.rsb, scrollAction } 
      }; 
    }
    case 'setScrollElement': {
      const { scrollElement } = action;
      return { 
        ...state,
        rsb: { ...state.rsb, scrollElement } 
      }; 
    }
    case 'setOpenAlbumInfo': {
      const { openAlbumInfo } = action;
      console.log('!REDUCER setOpenAlbumInfo -> ', openAlbumInfo);
      return { 
        ...state,
        rsb: { ...state.rsb, openAlbumInfo }
      };
    }
    case 'setTableContainerHeight': {
      const { tableContainerHeight } = action;
      return { 
        ...state,
        rsb: { ...state.rsb, tableContainerHeight }
      };
    }
    case 'setShowTrackTableOverlay': {
      const { showTrackTableOverlay } = action;
      return { 
        ...state,
        rsb: { ...state.rsb, showTrackTableOverlay }
      };
    }
    case 'setScrollToTop': {
      const { scrollToTop } = action;
      return { 
        ...state,
        rsb: { ...state.rsb, scrollToTop }
      };
    }
    case 'setShouldScroll': {
      const { shouldScroll } = action;
      return { 
        ...state,
        rsb: { ...state.rsb, shouldScroll }
      };
    }
    case 'setFilters': {
      const { filters } = action;
      
      return { 
        ...state,
        rsb: { ...state.rsb, filters: {
          ...state.rsb.filters,
          ...filters
        } }
      };
    }
    case 'setTotalCollectionCount': {
      const { totalCollectionCount } = action;
      
      return { 
        ...state,
        rsb: { 
          ...state.rsb,
          totalCollectionCount
        }
      }
    };
    
    // Album Reducers
    case 'setAlbumCollection': {
      return { 
        ...state,
        albumCollection: action.albums
      };
    }
    // Player Reducers
    case 'setAudioRef': {
      const { audioRef } = action;
      return { 
        ...state,
        player: { 
          ...state.player, 
          audioRef
        }
      };
    }
    case 'setAudioUrl': {
      return { 
        ...state,
        player: { 
          ...state.player, 
          audioUrl: action.track?.preview_url || null, 
          track: action.track,
          isPlaying: false,
          isPaused: false,
        }
      };
    }
    case 'setControls': {
      const { controls } = action;
      return { 
        ...state,
        player: { 
          ...state.player,  
          controls: {
            ...state.player.controls,
            ...controls
          }
        }
      };
    }
    // User Reducers
    case 'setUserInfo': {
      return { 
        ...state,
        user: action.userInfo
      }
    }
    default: {
      return state
    }
  }
}

// State Provider (store) for the app
export default function StateProvider({ children }: { children: ReactNode }) {
  const [appState, appDispatch] = useReducer<React.Reducer<AppState, ActionTypes>>(stateReducer, initialAppState);

  return (
    <AppStateContext.Provider value={appState}>
      <AppStateDispatchContext.Provider value={appDispatch}>
      {children}
      </AppStateDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}
