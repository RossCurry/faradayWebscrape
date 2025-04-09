import { useAppState } from '../../../state/AppStateHooks';
import { AlbumDetailView } from './AlbumDetailView';
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
    case 'albumDetail': {
      return (<AlbumDetailView />)
    }
    default: {
      return ( <AlbumView />)
    }
  }
}
