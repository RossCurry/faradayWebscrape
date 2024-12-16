import { useEffect, useState } from 'react'
import styles from './App.module.css'

import Header from './components/Header/Header'
import LeftSidebar from './components/LSB/LeftSidebar'
import RightSidebar from './components/RSB'
import { getUserInfoWithCode } from './services'
import { useAppDispatch } from './state/AppStateHooks'
import useQuery from './hooks/useQueryParams'
import useUpdateAlbums from './hooks/useUpdateAlbums'
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
      const userInfo = await getUserInfoWithCode(code)
      console.log('!FE get userInfo with code -> ', userInfo);
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
