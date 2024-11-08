import React from 'react'

import styles from './RightSidebar.module.css'
import Views from './Views'

export default function RightSidebar() {

  return (
    <div className={styles.rightSidebar}>
      <main>
        <Views />
      </main>
    </div>
  )
}
