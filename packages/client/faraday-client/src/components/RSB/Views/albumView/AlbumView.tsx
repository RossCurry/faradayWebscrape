import Footer from "../../Footer"
import AlbumTableContainer from "../../Tables/Albums/AlbumTableContainer"

import sharedStyles from '../SharedStyles.module.css'
import { AlbumCount } from "./components/AlbumCount"
import { FilterSection } from "./components/FilterSection"

export function AlbumView() {
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
        <AlbumTableContainer />
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

