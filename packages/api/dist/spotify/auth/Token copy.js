export default class Token {
    accessToken;
    expiresIn;
    constructor() {
        this.accessToken = null;
        this.expiresIn = null;
    }
    has() {
        return !!this.accessToken;
    }
    set(token) {
        console.log('Token set', token);
        this.accessToken = token.access_token;
        this.expiresIn = token.expires_in;
    }
    get() {
        console.log('Token got', this.accessToken);
        return this.accessToken;
    }
}
