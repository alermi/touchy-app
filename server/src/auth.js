const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

class Authenticator {
    constructor() {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }

    verifyIdToken(token) {
        return admin.auth().verifyIdToken(token);
    }

    setCustomUserClaims(uid, claims) {
        return admin.auth().setCustomUserClaims(uid, claims);
    }

    getUserByEmail(email){
        return admin.auth().getUserByEmail(email);
    }
}

module.exports = Authenticator;