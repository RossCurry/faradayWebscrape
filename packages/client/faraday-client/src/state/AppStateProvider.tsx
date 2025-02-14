import { 
  createContext, 
  ReactNode, 
  useReducer, 
  Dispatch,
} from 'react';
import { CheckedAlbumDict, CheckedTrackDict } from '../components/RSB/Tables/Albums/V_AlbumTable';
import { CONSTANTS, Views } from './constants';
import { SpotifySearchResult, SpotifyUserProfile } from '../types/spotify.types';
import { TrackListData } from '../components/RSB/Tables/Tracks/TrackTable';

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
  },
  player: {
    audioUrl: string | null,
    track: TrackListData | null
  }
  user: SpotifyUserProfile | null
};

const playlistPlaceholderTitle = `Faraday ${new Date().toLocaleString('en-US', { month: 'long' })} ${new Date().toLocaleString('en-US', { year: 'numeric' })}`

const initialAppState = {
  albumCollection: [],
  playlist: {
    custom: {},
    selectedPlaylistId: null,
    tracksCollection: null,
    title: playlistPlaceholderTitle,
    isLoading: false,
  },
  rsb: {
    view: CONSTANTS.views.albums,
    selectedAlbums: {},
    areAllAlbumsSelected: false,
    scrollAction: null,
    scrollElement: null,
  },
  player: {
    audioUrl: null,
    track: null,
  },
  user: null
}

type ActionTypes = 
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
// Main album collection
| { type: 'setAlbumCollection', albums: SpotifySearchResult[] | null }
// Player
| { type: 'setAudioUrl', track: TrackListData | null }
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
      return { 
        ...state, 
        playlist: { ...state.playlist, custom: updatedList } 
      };
    }
    case 'deleteTrackFromCustomPlaylist': {
      const playlist = { ...state.playlist.custom };
      delete playlist[action.trackId];
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
      return { 
        ...state, 
        playlist: { ...state.playlist, custom: playlist } 
      };
    }
    case 'resetCustomPlaylist': {
      return { 
        ...state, 
        playlist: { 
          ...state.playlist, 
          custom: {}, 
          tracksCollection: null 
        },
        rsb: { ...state.rsb, 
          selectedAlbums: {}, 
          areAllAlbumsSelected: false 
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
      const fullCollectionCount = state.albumCollection?.length || 0
      const setAllAlbumsSelected = (selectedAlbumsCount === fullCollectionCount)
      return { 
        ...state,
        rsb: { 
          ...state.rsb, 
          selectedAlbums: { ...state.rsb.selectedAlbums, [action.albumId]: true },
          areAllAlbumsSelected: setAllAlbumsSelected
        } 
      };
    }
    case 'deleteSelectedAlbum': {
      const copy = { ...state.rsb.selectedAlbums }
      delete copy[action.albumId]
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
      return { 
        ...state,
        rsb: { ...state.rsb, selectedAlbums: allSelected } 
      };
    }
    case 'deselectAllAlbums': {
      return { 
        ...state,
        rsb: { ...state.rsb, selectedAlbums: {} } 
      };
    }
    case 'setAllAlbumsSelected': {
      const { areSelected } = action;
      return { 
        ...state,
        rsb: { ...state.rsb, areAllAlbumsSelected: areSelected } 
      }; 
    }
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
    // Album Reducers
    case 'setAlbumCollection': {
      return { 
        ...state,
        albumCollection: action.albums
      };
    }
    // Player Reducers
    case 'setAudioUrl': {
      return { 
        ...state,
        player: { ...state.player, audioUrl: action.track?.preview_url || null, track: action.track }
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
