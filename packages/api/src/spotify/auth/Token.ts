export type AuthToken = {
  access_token: string,
  token_type: 'Bearer',
  expires_in: number
}

export default class Token {
  accessToken: string | null
  expiresIn: number | null
  constructor(){
    this.accessToken = null
    this.expiresIn = null
  }
  has(){
    return !!this.accessToken;
  }
  set(token: AuthToken){
    console.log('Token set', token)
    this.accessToken = token.access_token
    this.expiresIn = token.expires_in
  }
  get(){
    console.log('Token got', this.accessToken)
    return this.accessToken
  }
}