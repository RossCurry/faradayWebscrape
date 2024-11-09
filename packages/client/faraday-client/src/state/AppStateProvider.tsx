import { 
  createContext, 
  ReactNode, 
  useReducer, 
  Dispatch,
} from 'react';
import { CheckedTrackDict } from '../components/RSB/Tables/Albums/AlbumTable';
import { CONSTANTS, Views } from './constants';
import { SpotifySearchResult } from '../types/spotify.types';
import { TrackListData } from '../components/RSB/Tables/Tracks/TrackTable';

type AppState = {
  albumCollection: SpotifySearchResult[] | null,
  playlist: {
    custom: CheckedTrackDict,
    selectedPlaylistId: string | null,
    tracksCollection: SpotifySearchResult["trackList"] | null,
    newTitle: string,
    isLoading: boolean
  },
  rsb: {
    view: Views
  },
  player: {
    audioUrl: string | null,
    track: TrackListData | null
  }

};
const initialAppState = {
  albumCollection: null,
  playlist: {
    custom: {},
    selectedPlaylistId: null,
    tracksCollection: null,
    newTitle: 'Your new playlist',
    isLoading: false,
  },
  rsb: {
    view: CONSTANTS.views.albums
  },
  player: {
    audioUrl: null,
    track: null,
  }
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
// Main album collection
| { type: 'setAlbumCollection', albums: SpotifySearchResult[] | null }
// Player
| { type: 'setAudioUrl', track: TrackListData | null }

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
        playlist: { ...state.playlist, custom: {} } 
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
        playlist: { ...state.playlist, newTitle: action.title }
      }
    }
    case 'setIsLoading': {
      return {
        ...state,
        playlist: { ...state.playlist, isLoading: action.isLoading }
      }
    }
    // View Reducers
    case 'updateView': {
      return { 
        ...state,
        playlist: { ...state.playlist, selectedPlaylist: action.playlistId },
        rsb: { ...state.rsb, view: action.view } 
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
