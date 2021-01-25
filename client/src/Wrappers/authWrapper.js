import firebase from 'firebase/app'
import 'firebase/auth'

firebase.initializeApp({
    apiKey: 'AIzaSyCz0liPBXblxmbPOLU3hVH-6-nIs4Kr7QU',
    authDomain: 'ait-krea.firebaseapp.com'
})
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)

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

    onAuthStateChanged(callback) {
        return firebase.auth().onAuthStateChanged(callback);
    }
}

const authWrapper = new AuthWrapper();

export default authWrapper;