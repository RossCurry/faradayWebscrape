import Footer from "../../Footer"
import styles from './AlbumDetailView.module.css'
import sharedStyles from '../SharedStyles.module.css'
import { TrackTableContainer } from "./TrackTableContainer"
import { useIsMobile } from "../../../../hooks/useIsMobile"

export function AlbumDetailView() {
  
  return (
    <section 
      id='albumDetailView' 
      className={`
        ${sharedStyles.albumCollection}
        ${sharedStyles.viewContainerLayout}
      `}
    >
      <HeaderAlbumDetailView />
      <TrackTableContainer />
      <Footer />
    </section>
  )
}

function HeaderAlbumDetailView() {
  const isMobile = useIsMobile()
  if (isMobile) return null
  return (
    <header className={`${sharedStyles.viewHeaderShared} ${styles.headerAlbumDetail}`}>
    </header>
  )
}


