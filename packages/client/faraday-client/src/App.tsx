import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import styles from './app.module.css'

import Header from './components/Header/Header'
import LeftSidebar from './components/LSB/LeftSidebar'
import RightSidebar from './components/RSB'
import { getUserInfoWithCode } from './services/services'
import { useAppDispatch } from './state/AppStateHooks'
import useQuery from './hooks/useQueryParams'
import useGetAndSetUserInfo from './hooks/useGetAndSetUserInfo'



function App({ redirected }: { redirected?: true }) {
  const isRedirectedRef = useRef(!!redirected)
  // Call this hook to get the user info if we are not redirected
  useGetAndSetUserInfo(redirected)

  const dispatch = useAppDispatch();
  const { searchParams } = useQuery()
  const navigate = useNavigate()

  useEffect(() => {
    async function updateUserInfo(){
      // Using ref to avoid re-renders calling getUserInfoWithCode twice
      isRedirectedRef.current = false;
      console.log('!updateUserInfo -> ', redirected, 'code', !!searchParams.get('code'));
      const code = searchParams.get('code')
      if (!code) return;
      const userInfo = await getUserInfoWithCode(code)

      // Update Store
      dispatch({ type: 'setUserInfo', userInfo })

      // Navigate back to the main app removing the redirect and code
      navigate('/')
    }
    if (isRedirectedRef?.current) {
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
