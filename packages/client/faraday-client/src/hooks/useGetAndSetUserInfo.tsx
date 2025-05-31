import { useEffect } from 'react'
import { getIsJwtExpired } from '../utils/decodeJwt';
import { getUserInfoWithToken } from '../services/services';
import { useAppDispatch } from '../state/AppStateHooks';
import { AppStateDispatch } from '../state/AppStateProvider';


async function getAndSetUserInfo(token: string, dispatch: AppStateDispatch) {
  const userInfo = await getUserInfoWithToken(token)
  dispatch({ type: 'setUserInfo', userInfo })
}


export default function useGetAndSetUserInfo(redirected?: boolean) {
  const dispatch = useAppDispatch()

  // TODO check that changes here means that we wont log in after token expiration. but no other side effects
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
  }, [redirected])
}


