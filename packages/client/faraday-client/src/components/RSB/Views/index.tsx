import { useAppState } from '../../../state/AppStateHooks';
import { AlbumView } from './AlbumView/AlbumView';
import { PlaylistView } from './PlaylistView/PlaylistView';

export default function Views() {
  const state = useAppState()
  const view = state.rsb.view
  switch (view) {
    case 'albums': {
      return ( <AlbumView />)
    }
    case 'playlist': {
      return (<PlaylistView />)
    }
    default: {
      return ( <AlbumView />)
    }
  }
}
