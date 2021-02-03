const admin = require("firebase-admin");

var serviceAccount;
if (process.env.FIREBASE_ENV === "production") {
  serviceAccount = require(process.env.PRODUCTION_SERVICE_ACCOUNT_KEY_PATH);
} else if (process.env.FIREBASE_ENV === "development") {
  serviceAccount = require(process.env.DEVELOPMENT_SERVICE_ACCOUNT_KEY_PATH);
} else {
  throw new Error("Authentication node_env mode not handled.");
}

class Authenticator {
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  verifyIdToken(token) {
    return admin.auth().verifyIdToken(token);
  }

  setCustomUserClaims(uid, claims) {
    return admin.auth().setCustomUserClaims(uid, claims);
  }

  getUserByEmail(email) {
    return admin.auth().getUserByEmail(email);
  }
}

module.exports = Authenticator;
