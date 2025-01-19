import { useAppState } from '../../../state/AppStateHooks';
import { AlbumView } from './albumView/AlbumView';
import { PlaylistView } from './playlistView/PlaylistView';

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
