import React, { useEffect, useState } from 'react'
import styles from './App.module.css'

import Header from './components/Header/Header'
import LeftSidebar from './components/LSB/LeftSidebar'
import RightSidebar from './components/RSB'
import { getAvailableAlbums, getUserInfo } from './services'
import { useAppDispatch, useAppState } from './state/AppStateHooks'
import useQuery from './hooks/useQueryParams'



function App({ redirected }: { redirected?: true }) {
  const [isUserdataLoading, setIsUserdataLoading] = useState<boolean>(false)
  const dispatch = useAppDispatch();
  const { searchParams } = useQuery()
  const code = searchParams.get('code')

  useEffect(() => {
    async function updateAlbums(){
      const availableAlbums = await getAvailableAlbums()
      if (availableAlbums) dispatch({ type: 'setAlbumCollection', albums: availableAlbums })
    }
    updateAlbums()

    async function checkIsUserLoggedIn(){
      console.log('!CALL checkIsUserLoggedIn -> ');
      const token = window.localStorage.getItem('jwt')
      console.log('!token -> ', token);
      if (token) {
        const userInfo = await getUserInfo(null, token)
        dispatch({ type: 'setUserInfo', userInfo })
        setIsUserdataLoading(false)
      }
    }
    if (!redirected){
      checkIsUserLoggedIn()
    }
    async function updateUserInfo(){
      console.log('!CALL updateUserInfo -> ');
      if (!code) return;
      const userInfo = await getUserInfo(code)
      console.log('!FE userInfo -> ', userInfo);
      dispatch({ type: 'setUserInfo', userInfo })
      setIsUserdataLoading(false)
    }
    if (redirected && !isUserdataLoading) {
      setIsUserdataLoading(true)
      updateUserInfo()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div id={'appLayout'} className={styles.appLayout} >
      <Header />
      <LeftSidebar />
      <RightSidebar />
    </div>
  )
}

export default App
