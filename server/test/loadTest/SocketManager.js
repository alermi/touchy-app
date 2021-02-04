const Sender = require("./Sender");
const Receiver = require("./Receiver");

class SocketManager {
  constructor(serverURL, tokenGenerator) {
    this.senders = [];
    this.receivers = [];
    this.serverURL = serverURL;
    this.tokenGenerator = tokenGenerator;
  }

  startUpdates() {
    this.updateTokenInterval = setInterval(() => {
      this.refreshTokens();
    }, 1000 * 60 * 5); // Every 5 mins
  }

  stopUpdates() {
    clearInterval(this.updateTokenInterval);
  }
  async refreshTokens() {
    console.log("Refreshing all sockets");
    for (let i = 0; i < this.senders.length; i++) {
      const senderEmail = this.tokenGenerator.sendersList[i];
      const newSenderToken = await this.tokenGenerator.getRefreshedToken(
        senderEmail,
        true
      );
      this.senders[i].setToken(newSenderToken);
    }
    const receiverEmail = this.tokenGenerator.receiverEmail;
    const newReceiverToken = await this.tokenGenerator.getRefreshedToken(
      receiverEmail,
      true
    );
    for (let i = 0; i < this.receivers.length; i++) {
      this.receivers[i].setToken(newReceiverToken);
    }
  }
  async addSender() {
    try {
      const { token, uid } = await this.tokenGenerator.generateSender();
      this.senders.push(new Sender(token, uid, this.serverURL));
      return Promise.resolve();
    } catch (err) {
      console.error("Could not add sender: " + err);
    }
  }

  async addReceiver() {
    try {
      const { token, uid } = await this.tokenGenerator.generateReceiver();
      this.receivers.push(new Receiver(token, uid, this.serverURL));
      return Promise.resolve();
    } catch (err) {
      console.error("Could not add receiver: " + err.message);
    }
  }

  async addSenders(numSenders) {
    for (let i = 0; i < numSenders; i++) {
      await this.addSender();
    }
    return Promise.resolve();
  }

  async addReceivers(numReceivers) {
    for (let i = 0; i < numReceivers; i++) {
      await this.addReceiver();
    }
    return Promise.resolve();
  }

  send(numVals, valueChangeTime, speed) {
    for (let i = 0; i < numVals; i++) {
      for (let j = 0; j < this.senders.length; j++) {
        const randX = Math.random();
        const randY = Math.random();
        this.senders[j].addToSendQueue([randX, randY], valueChangeTime, speed);
      }
    }
  }

  validate() {
    let totalSum = 0;
    let correctSum = 0;
    console.log("Starting validation");
    for (let j = 0; j < this.receivers.length; j++) {
      console.log("Receiver " + this.receivers[j].uid + " history:");
      const receiverHistory = this.receivers[j].messageHistory;
      for (let i = 0; i < this.senders.length; i++) {
        // console.log(this.receivers[0].messageHistory.get(this.senders[i].uid));
        const { total, correct } = this.senders[i].validateReceiverHistory(
          receiverHistory.get(this.senders[i].uid)
        );
        totalSum += total;
        correctSum += correct;
      }
    }
    console.log(
      `Validate result: Total=${totalSum}, Correct=${correctSum}. Percentage Correct=${
        correctSum / totalSum
      }`
    );
  }

  shutDownAll() {
    console.log("Shutting down all sockets");
    for (let i = 0; i < this.receivers.length; i++) {
      this.receivers[i].shutDown();
    }
    this.receivers = [];
    for (let i = 0; i < this.senders.length; i++) {
      this.senders[i].shutDown();
    }
    this.senders = [];
  }
}

module.exports = SocketManager;
