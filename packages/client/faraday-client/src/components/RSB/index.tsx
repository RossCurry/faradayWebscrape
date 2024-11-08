import React from 'react'

import styles from './RightSidebar.module.css'
import Views from './Views'
import Footer from './Footer'

export default function RightSidebar() {

  return (
    <div id='RightSidebar' className={styles.rightSidebar}>
      <main className={styles.viewContainer}>
        <Views />
      </main>
      <Footer />
    </div>
  )
}
