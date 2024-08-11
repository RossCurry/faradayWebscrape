export type CodeChallenge = string

export default class CodeVerifier {
  codeChallenge: string | null
  constructor(){
    this.codeChallenge = null
  }
  has(){
    return !!this.codeChallenge;
  }
  set(codeChallenge: CodeChallenge){
    console.log('CodeChallenge set', codeChallenge)
    this.codeChallenge = codeChallenge;
  }
  get(){
    console.log('CodeChallenge got', this.codeChallenge)
    return this.codeChallenge;
  }
}