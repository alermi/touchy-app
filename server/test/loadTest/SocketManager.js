const Sender = require("./Sender");
const Receiver = require("./Receiver");

class SocketManager {
  constructor(serverURL, tokenGenerator) {
    this.senders = [];
    this.receivers = [];
    this.serverURL = serverURL;
    this.tokenGenerator = tokenGenerator;
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
    console.log("Starting validation");
    for (let j = 0; j < this.receivers.length; j++) {
      const receiverHistory = this.receivers[j].messageHistory;
      for (let i = 0; i < this.senders.length; i++) {
        // console.log(this.receivers[0].messageHistory.get(this.senders[i].uid));
        this.senders[i].validateReceiverHistory(
          receiverHistory.get(this.senders[i].uid)
        );
      }
    }
  }

  shutDownAll() {
    console.log("Shutting down all sockets");
    for (let i = 0; i < this.numReceivers; i++) {
      this.receivers[i].shutDown();
    }
    for (let i = 0; i < this.numSenders; i++) {
      this.senders[i].shutDown();
    }
  }
}

module.exports = SocketManager;
