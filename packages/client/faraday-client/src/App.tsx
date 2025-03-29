import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import styles from './App.module.css'
import './Colors.module.css'

import Header from './components/Header/Header'
import LeftSidebar from './components/LSB/LeftSidebar'
import RightSidebar from './components/RSB'
import { getUserInfoWithCode } from './services/services'
import { useAppDispatch } from './state/AppStateHooks'
import useQuery from './hooks/useQueryParams'
import useGetAndSetUserInfo from './hooks/useGetAndSetUserInfo'



function App({ redirected }: { redirected?: true }) {
  useGetAndSetUserInfo(redirected)

  const [isUserdataLoading, setIsUserdataLoading] = useState<boolean>(false)
  const dispatch = useAppDispatch();
  const { searchParams } = useQuery()
  const navigate = useNavigate()
  
  useEffect(() => {
    async function updateUserInfo(){
      const code = searchParams.get('code')
      if (!code) return;
      const userInfo = await getUserInfoWithCode(code)
      
      // Update Store
      dispatch({ type: 'setUserInfo', userInfo })
      setIsUserdataLoading(false)
      
      // Navigate back to the main app removing the redirect and code
      navigate('/')
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
