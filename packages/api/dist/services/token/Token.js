export default class Token {
    accessToken;
    expiresIn;
    currentUser;
    refresh_token;
    scope;
    constructor() {
        console.log('!Token  constructor-> ');
        this.accessToken = null;
        this.expiresIn = null;
        this.refresh_token = undefined;
        this.scope = undefined;
        this.currentUser = null;
    }
    has() {
        return !!this.accessToken;
    }
    set(token) {
        console.log('Token set', token);
        this.accessToken = token.access_token;
        this.expiresIn = token.expires_in;
        this.refresh_token = token.refresh_token;
        this.scope = token.scope;
    }
    get() {
        console.log('Token got', this.accessToken);
        return this.accessToken;
    }
    setUserInfo(userInfo) {
        this.currentUser = userInfo;
    }
    getUserInfo() {
        return this.currentUser;
    }
    getEndpointInfo() {
        return {
            access_token: this.accessToken,
            expires_in: this.expiresIn,
            refresh_token: this.refresh_token,
            scope: this.scope,
        };
    }
}
