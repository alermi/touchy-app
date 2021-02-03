const io = require("socket.io-client");

class Receiver {
  constructor(token, uid, serverURL) {
    this.token = token;
    this.uid = uid;
    this.isConnected = false;
    this.messageHistory = new Map();

    this.socket = io(serverURL, {
      query: {
        socketType: "receiver",
      },
      auth: {
        token: token,
      },
    });
    this.socket.on("connect", () => {
      this.isConnected = true;
      console.log("Receiver " + this.uid + " connected.");
    });
    this.socket.on("disconnect", () => {
      this.isConnected = false;
      console.log("Receiver " + this.uid + " disconnected.");
    });
    this.socket.on("message", (data) => {
      this.handleMessageReceived(data);
    });
  }

  handleMessageReceived(data) {
    if (data.length % 5 !== 0) {
      throw new Error("Data received is not a multiple of 5.");
    }
    for (let i = 0; i < data.length; i += 5) {
      const [uid, x, y, isActive, timestamp] = data.slice(i, i + 5);
      let uidHistory = this.messageHistory.get(uid);
      if (!uidHistory) {
        uidHistory = [];
      }
      uidHistory.push({ x: x, y: y, isActive: isActive, timestamp: timestamp });
      this.messageHistory.set(uid, uidHistory);
    }
  }

  clearReceivedMessages() {
    this.receivedMessages = [];
  }

  shutDown() {
    this.socket.disconnect();
  }

  printMessageHistory() {
    console.log(this.messageHistory);
  }
}
module.exports = Receiver;
