import { 
  useContext, 
} from 'react';
import { AppStateContext, AppStateDispatchContext } from './AppStateProvider';

// Helper hooks
export function useAppState() {
  return useContext(AppStateContext);
}

export function useAppDispatch() {
  return useContext(AppStateDispatchContext);
}