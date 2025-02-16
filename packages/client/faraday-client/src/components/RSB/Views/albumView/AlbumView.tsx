import { useAppState } from "../../../../state/AppStateHooks"
import Footer from "../../Footer"
import AlbumTableContainer from "../../Tables/Albums/TableContainer"
// import styles from './AlbumView.module.css'
import sharedStyles from '../SharedStyles.module.css'

export function AlbumView() {
  const { albumCollection } = useAppState()
  return (
    <section 
      id='albumView' 
      className={`
        ${sharedStyles.albumCollection}
        ${sharedStyles.viewContainerLayout}
      `}
    >
      <HeaderAlbumView />
      <section className={sharedStyles.viewTableContainer}>
        {albumCollection &&
          <AlbumTableContainer data={albumCollection} />
        }
      </section>
        <Footer />
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