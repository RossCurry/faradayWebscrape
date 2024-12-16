import { useEffect } from 'react'
import { getIsJwtExpired } from '../utils/decodeJwt';
import { getUserInfoWithToken } from '../services';
import { useAppDispatch } from '../state/AppStateHooks';
import { AppStateDispatch } from '../state/AppStateProvider';
import useValidateJwtTokenExpiration from './useValidateJwtTokenExpiration';


async function getAndSetUserInfo(token: string, dispatch: AppStateDispatch) {
  const userInfo = await getUserInfoWithToken(token)
  dispatch({ type: 'setUserInfo', userInfo })
}


export default function useGetAndSetUserInfo(redirected?: boolean) {
  useValidateJwtTokenExpiration()
  const dispatch = useAppDispatch()
  
  useEffect(() => {
    // Dont do anything if we've been redirected. 
    if (redirected) return
    const token = window.localStorage.getItem('jwt')
    if (token) {
      const isTokenExpired = getIsJwtExpired(token);
      if (!isTokenExpired) {
        getAndSetUserInfo(token, dispatch)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}


