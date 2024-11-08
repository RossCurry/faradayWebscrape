import React, { useEffect } from 'react'
import styles from './App.module.css'

import Header from './components/Header/Header'
import LeftSidebar from './components/LSB/LeftSidebar'
import RightSidebar from './components/RSB'
import { getAvailableAlbums } from './services'
import { useAppDispatch } from './state/AppStateHooks'



function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function updateAlbums(){
      const availableAlbums = await getAvailableAlbums()
      if (availableAlbums) dispatch({ type: 'setAlbumCollection', albums: availableAlbums })
    }
    updateAlbums()
  }, [dispatch])

  return (
    <div id={'appLayout'} className={styles.appLayout} >
      <Header />
      <LeftSidebar />
      <RightSidebar />
    </div>
  )
}

export default App
