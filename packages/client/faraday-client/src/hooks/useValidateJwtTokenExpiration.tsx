import { useEffect } from 'react'
import { getIsJwtExpired } from '../utils/decodeJwt';

export default function useValidateJwtTokenExpiration() {
  useEffect(() => {
    const token = window.localStorage.getItem('jwt')
    if (token) {
      const isTokenExpired = getIsJwtExpired(token)
      console.log('!useValidateJwtTokenExpiration  => isTokenExpired -> ', isTokenExpired);
      if (isTokenExpired){
        window.localStorage.removeItem('jwt')
      }
    }
  })
}

// Not really a hook
export function useIsJwtTokenExpired() {
  const token = window.localStorage.getItem('jwt')
  return token ? getIsJwtExpired(token) : true;
}
