import { useAppState } from "../../../../state/AppStateHooks"
import AlbumTable from "../../Tables/Albums/V_AlbumTable"
// import styles from './AlbumView.module.css'
import sharedStyles from '../SharedStyles.module.css'

export function AlbumView() {
  const { albumCollection } = useAppState()
  return (
    <section id='albumView' className={sharedStyles.albumCollection}>
      {/* TODO add statistic */}
      <HeaderAlbumView />
      {albumCollection &&
        <AlbumTable data={albumCollection} />
      }
    </section>
  )
}

function HeaderAlbumView() {
  const { albumCollection } = useAppState()

  return (
    <header className={sharedStyles.viewHeaderShared}>
      <p>{albumCollection?.length || 0} Albums</p>
      <section>FILTER SECTION</section>
    </header>
  )
}