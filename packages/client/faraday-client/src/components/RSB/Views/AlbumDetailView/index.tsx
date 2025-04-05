import Footer from "../../Footer"
import styles from './AlbumDetailView.module.css'
import sharedStyles from '../SharedStyles.module.css'
import { TrackTableContainer } from "./TrackTableContainer"

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
  return (
    <header className={`${sharedStyles.viewHeaderShared} ${styles.headerAlbumDetail}`}>
    </header>
  )
}


