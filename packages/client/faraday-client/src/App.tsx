import React, { useEffect, useState } from 'react'
import styles from './App.module.css'

import Header from './components/Header/Header'
import LeftSidebar from './components/LSB/LeftSidebar'
import RightSidebar from './components/RSB'
import { getAvailableAlbums, getUserInfo } from './services'
import { useAppDispatch, useAppState } from './state/AppStateHooks'
import useQuery from './hooks/useQueryParams'
import { getIsJwtExpired } from './utils/decodeJwt'
import useUpdateAlbums from './hooks/useUpdateAlbums'
import useValidateJwtTokenExpiration from './hooks/useValidateJwtTokenExpiration'
import useGetAndSetUserInfo from './hooks/useGetAndSetUserInfo'



function App({ redirected }: { redirected?: true }) {
  useUpdateAlbums()
  useGetAndSetUserInfo(redirected)
  
  const [isUserdataLoading, setIsUserdataLoading] = useState<boolean>(false)
  const dispatch = useAppDispatch();
  const { searchParams } = useQuery()
  const code = searchParams.get('code')

  useEffect(() => {
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
