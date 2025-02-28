import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();
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
        if (!token.access_token) {
            console.warn('No valid token.access_token, no token set');
            return;
        }
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
    createJwtToken(userInfo) {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET)
            throw new Error('No ENV vars found for secret');
        const spotifyTokenExpiration = '1h';
        const token = jwt.sign(userInfo, JWT_SECRET, { expiresIn: spotifyTokenExpiration });
        return token;
    }
    verifyJwtToken(token) {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET)
            throw new Error('No ENV vars found for secret');
        const verifiedToken = jwt.verify(token, JWT_SECRET);
        return verifiedToken;
    }
}
