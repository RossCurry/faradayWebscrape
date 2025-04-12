import { useIsMobile } from "../../../../hooks/useIsMobile"
import Footer from "../../Footer"
import AlbumTableContainer from "../../Tables/Albums/AlbumTableContainer"
import { HeaderAlbumTableView } from "../../Tables/Albums/sections/columns/components/HeaderAlbumTableView"

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
  const isMobile = useIsMobile()
  return (
    <header className={sharedStyles.viewHeaderShared}>
      <span style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {isMobile && <HeaderAlbumTableView />}
        <AlbumCount />
      </span>
      <FilterSection />
    </header>
  )
}

