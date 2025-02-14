import { useAppState } from '../../../state/AppStateHooks';
import { AlbumView } from './AlbumView/AlbumView';
import { PlaylistView } from './PlaylistView/PlaylistView';

export default function Views({ scrollElement }: { scrollElement: React.RefObject<HTMLElement> }) {
  const state = useAppState()
  const view = state.rsb.view
  switch (view) {
    case 'albums': {
      return ( <AlbumView scrollElement={scrollElement} />)
    }
    case 'playlist': {
      return (<PlaylistView />)
    }
    default: {
      return ( <AlbumView scrollElement={scrollElement} />)
    }
  }
}
