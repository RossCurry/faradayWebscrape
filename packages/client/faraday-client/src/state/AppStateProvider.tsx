import { 
  createContext, 
  ReactNode, 
  useReducer, 
  Dispatch,
} from 'react';
import { CheckedTrackDict } from '../components/RSB/Tables/Albums/AlbumTable';


type AppState = {
  playlist: {
    custom: CheckedTrackDict
  }
};
const initialAppState = {
  playlist: {
    custom: {}
  }
}

type ActionTypes = 
| { type: 'addTrackToCustomPlaylist', trackId: string }
| { type: 'deleteTrackFromCustomPlaylist', trackId: string }
| { type: 'addTracksToCustomPlaylist', trackIds: string[] }
| { type: 'deleteTracksFromCustomPlaylist', trackIds: string[] }
| { type: 'resetCustomPlaylist' }

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
