import { useAppState } from "../../../../state/AppStateHooks"
import Footer from "../../Footer"
import AlbumTableContainer from "../../Tables/Albums/TableContainer"

import sharedStyles from '../SharedStyles.module.css'
import { AlbumCount } from "./components/AlbumCount"
import { FilterSection } from "./components/FilterSection"

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

  return (
    <header className={sharedStyles.viewHeaderShared}>
      <AlbumCount />
      <FilterSection />
    </header>
  )
}

