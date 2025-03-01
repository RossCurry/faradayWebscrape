import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { SpotifyUserProfile } from "../../controllers/spotify/spotify.types.js"
dotenv.config();

export type AuthToken = {
  access_token: string | null,
  token_type: 'Bearer',
  expires_in: number | null,
  refresh_token?: string,
  scope?: string
}

// TODO re-use this class to deal with JWT token and use state for current user and mongo for user data retrival
export default class Token {
  accessToken: string | null
  expiresIn: number | null
  currentUser: SpotifyUserProfile | null
  refresh_token: string | undefined
  scope: string | undefined

  constructor() {
    console.log('!Token  constructor-> ')
    this.accessToken = null
    this.expiresIn = null
    this.refresh_token = undefined
    this.scope = undefined
    this.currentUser = null

  }
  has() {
    return !!this.accessToken;
  }
  set(token: AuthToken) {
    if (!token.access_token) {
      console.warn('No valid token.access_token, no token set')
      return;
    }
    console.log('Token set', token)
    this.accessToken = token.access_token
    this.expiresIn = token.expires_in
    this.refresh_token = token.refresh_token
    this.scope = token.scope
  }
  get() {
    console.log('Token got', this.accessToken)
    return this.accessToken
  }
  setUserInfo(userInfo: SpotifyUserProfile) {
    this.currentUser = userInfo
  }
  getUserInfo() {
    return this.currentUser
  }
  getEndpointInfo(): Omit<AuthToken, 'token_type'> {
    return {
      access_token: this.accessToken,
      expires_in: this.expiresIn,
      refresh_token: this.refresh_token,
      scope: this.scope,
    }
  }
  decodeJwtToken(token: string){
    const decoded = jwt.decode(token, { complete: true });
    return decoded;
  }
  createJwtToken(userInfo: SpotifyUserProfile){
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) throw new Error('No ENV vars found for secret')

    // The previous token user info will have expiration info
    const { iat, exp, ...user } = userInfo as any;
    
    // Actual spotify token last an hour
    const spotifyTokenExpiration = '55m'
    
    const token = jwt.sign(
      user, 
      JWT_SECRET, 
      { expiresIn: spotifyTokenExpiration }
    );
    console.log('!createJwtToken -> created');
    return token
  }
  verifyJwtToken(token: string){
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) throw new Error('No ENV vars found for secret')
    try {
      const verifiedToken = jwt.verify(token, JWT_SECRET);
      return verifiedToken;
    } catch (error) {
      console.error('!verifiedToken error -> ', error);
      throw error
    }
  }
  isJwtTokenExpired(token: string){
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) throw new Error('No ENV vars found for secret')
    try {
      const verifiedToken = jwt.verify(token, JWT_SECRET);
      return verifiedToken;
    } catch (error) {
      if (error instanceof Error){
        const expiredName = 'TokenExpiredError'
        const expiredMessage = 'jwt expired'
        const isExpired = error.name === expiredName || error.message === expiredMessage;
        console.error('!isJwtTokenExpired isExpired -> ', isExpired);
        if (isExpired) return isExpired;
      }
      throw error
    }
  }
}