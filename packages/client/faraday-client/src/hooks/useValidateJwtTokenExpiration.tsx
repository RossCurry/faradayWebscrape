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
