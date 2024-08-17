import { SpotifyUserProfile } from "../../controllers/spotify/spotify.types.js"

export type AuthToken = {
  access_token: string | null,
  token_type: 'Bearer',
  expires_in: number | null,
  refresh_token?: string,
  scope?: string
}

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
}