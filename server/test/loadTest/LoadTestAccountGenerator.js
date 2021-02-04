const firebase = require("firebase");

firebase.initializeApp({
  apiKey: "AIzaSyDEXJBfYS8aoRmHkRqkcX-O_33KcaDMaTw",
  authDomain: "ait-development-4f5bc.firebaseapp.com",
});
class LoadTestAccountGenerator {
  constructor(numSenders) {
    this.numSenders = numSenders;
    this.sendersList = [];
    this.senderTokens = new Array(numSenders).fill(null);
    for (let i = 1; i <= numSenders; i++) {
      this.sendersList.push(`sender@a.${i}`);
    }
    this.receiverEmail = "receiver@a.1";
    this.password = "123123";
    this.senderIndex = 0;
    this.receiverTokens = [];
    this.userMap = new Map();
  }

  reset() {
    this.senderIndex = 0;
  }

  getRefreshedToken(email, forceRefresh) {
    const user = this.userMap.get(email);
    return user.getIdToken(forceRefresh);
  }

  forceRefreshReceiverToken() {}

  async generateSender() {
    if (this.senderIndex >= this.numSenders) {
      console.error("ERROR: AccountGenerator ran out of senders to get.");
      return Promise.reject();
    }
    const senderEmail = this.sendersList[this.senderIndex];
    const cachedSenderToken = this.senderTokens[this.senderIndex];
    if (cachedSenderToken != null) {
      console.log("Returning cached sender token");
      this.senderIndex++;
      return { token: cachedSenderToken, uid: senderEmail };
    } else {
      try {
        const userCredential = await firebase
          .auth()
          .signInWithEmailAndPassword(senderEmail, this.password);
        const token = await userCredential.user.getIdToken(false);
        this.userMap.set(senderEmail, userCredential.user);
        this.senderTokens[this.senderIndex] = token;
        this.senderIndex++;
        return { token: token, uid: senderEmail };
      } catch (err) {
        console.error(
          "ERROR: Error at AccountGenerator getNextSenderToken: " + err.message
        );
        return Promise.reject();
      }
    }
  }
  async generateReceiver() {
    if (this.receiverToken == null) {
      const userCredential = await firebase
        .auth()
        .signInWithEmailAndPassword(this.receiverEmail, this.password);
      const token = await userCredential.user.getIdToken(false);
      this.userMap.set(this.receiverEmail, userCredential.user);
      this.receiverToken = token;
      return { token: token, uid: this.receiverEmail };
    } else return { token: this.receiverToken, uid: this.receiverEmail };
  }
}

module.exports = LoadTestAccountGenerator;
