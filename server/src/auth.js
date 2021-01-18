const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

class Authenticator {
    constructor() {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }

    verifyIdToken(token) {
        return admin.auth().verifyIdToken(token).then((decodedToken) => {
            return decodedToken.uid;
        });
    }
}

module.exports = Authenticator;