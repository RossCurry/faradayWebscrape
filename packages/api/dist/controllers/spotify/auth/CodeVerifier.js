export default class CodeVerifier {
    codeChallenge;
    constructor() {
        console.log('!CodeVerifier  constructor-> ');
        this.codeChallenge = null;
    }
    has() {
        return !!this.codeChallenge;
    }
    set(codeChallenge) {
        console.log('CodeChallenge set', codeChallenge);
        this.codeChallenge = codeChallenge;
    }
    get() {
        console.log('CodeChallenge got', this.codeChallenge);
        return this.codeChallenge;
    }
}
