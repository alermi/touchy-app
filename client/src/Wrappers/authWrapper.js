import firebase from 'firebase/app'
import 'firebase/auth'

firebase.initializeApp({
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN
})
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)

class AuthWrapper {
    constructor() {
        this.GoogleAuthProvider = {
            PROVIDER_ID: firebase.auth.GoogleAuthProvider.PROVIDER_ID
        };
        this.FacebookAuthProvider = {
            PROVIDER_ID: firebase.auth.FacebookAuthProvider.PROVIDER_ID
        };
        this.EmailAuthProvider = {
            PROVIDER_ID: firebase.auth.EmailAuthProvider.PROVIDER_ID,
            EMAIL_LINK_SIGN_IN_METHOD: firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD
        };
    }

    getAuth() {
        return firebase.auth();
    }

    signOut() {
        return firebase.auth().signOut();
    }

    onIdTokenChanged(callback) {
        return firebase.auth().onIdTokenChanged(callback);
    }
}

const authWrapper = new AuthWrapper();

export default authWrapper;