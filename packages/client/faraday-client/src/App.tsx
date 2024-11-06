import React from 'react'
import styles from './App.module.css'

import Header from './components/Header/Header'
import LeftSidebar from './components/LSB/LeftSidebar'
import RightSidebar from './components/RSB/RightSidebar'



function App() {
  return (
    <div id={'appLayout'} className={styles.appLayout} >
      <Header />
      <LeftSidebar />
      <RightSidebar />
    </div>
  )
}

export default App
