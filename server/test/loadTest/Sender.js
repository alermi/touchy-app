const io = require("socket.io-client");
const assert = require("assert");

class Sender {
  constructor(token, uid, serverURL) {
    this.token = token;
    this.uid = uid;
    this.isConnected = false;
    this.lastTime = -1;
    this.socket = io(serverURL, {
      query: {
        socketType: "sender",
      },
      auth: {
        token: token,
      },
    });
    this.socket.on("connect", () => {
      this.isConnected = true;
      console.log("Sender " + this.uid + " connected.");
      if (!this.timeout && this.sendQueue.length > 0) {
        if (this.interval != null) {
          // Continue where you left off at disconnect (Restart sending the last data from scratch);
          this.timeout = setTimeout(() => {
            this.moveToNextSend();
          }, this.lastTime);
        } else {
          // Start sending normally
          this.moveToNextSend();
        }
      }
    });
    this.socket.on("disconnect", (reason) => {
      this.isConnected = false;
      clearTimeout(this.timeout);
      this.timeout = null;
      console.log("Sender " + this.uid + " disconnected. Reason: " + reason);
    });

    this.sendQueue = [];
    this.sendHistory = [];
    this.interval = null;
    this.timeout = null;
  }

  setToken(token) {
    if (this.socket.io.opts.auth.token !== token) {
      this.socket.io.opts.auth = {
        token: token,
      };
      console.log("Updated token for " + this.uid);
    } else {
      console.log("Token did not change for " + this.uid);
    }
  }
  addToSendQueue(data, time, speed) {
    this.sendQueue.push({ data: data, time: time, speed: speed });
    if (this.isConnected && !this.timeout) {
      if (!!this.interval) {
        throw new Error(
          "Timeout was null but interval was not. Sender " + this.uid
        );
      }
      this.moveToNextSend();
    }
  }

  moveToNextSend() {
    console.log("Sender " + this.uid + " is moving to next send.");
    if (!!this.interval) {
      clearInterval(this.interval);
    }
    this.interval = null;
    if (this.sendQueue.length > 0) {
      let { data, time, speed } = this.sendQueue.shift();
      this.lastTime = time;
      this.sendHistory.push(data);
      this.interval = setInterval(() => {
        this.socket.send(data);
      }, speed);
      this.timeout = setTimeout(() => {
        this.moveToNextSend();
      }, time);
    }
  }
  validateReceiverHistory(receiverHistory) {
    let filteredReceiverHistory = receiverHistory
      .filter((data) => {
        return data.isActive;
      })
      .map((data) => {
        return [data.x, data.y];
      });
    let conciseReceiverHistory = this.removeRedundantEntries(
      filteredReceiverHistory
    );
    let conciseSenderHistory = this.removeRedundantEntries(
      filteredReceiverHistory
    );
    // console.log(conciseReceiverHistory);
    // console.log(conciseSenderHistory);
    if (conciseReceiverHistory.length == 0) {
      console.log(
        "ERROR: ConciseReceiverHistory was empty at validateReceiverHistory."
      );
      return { total: conciseSenderHistory.length, correct: 0 };
    }
    if (conciseSenderHistory.length == 0) {
      console.log(
        "ERROR: ConciseSenderHistory was empty at validateReceiverHistory."
      );
      return { total: 0, correct: 0 };
    }
    try {
      assert.deepStrictEqual(conciseReceiverHistory, conciseSenderHistory);
      return {
        total: conciseReceiverHistory.length,
        correct: conciseReceiverHistory.length,
      };
    } catch (err) {
      console.log(
        "Error on validateReceiverHistory for sender " +
          this.uid +
          ": " +
          err.message
      );
      const total =
        conciseReceiverHistory.length > conciseSenderHistory.length
          ? conciseReceiverHistory.length
          : conciseSenderHistory.length;
      return {
        total: total,
        correct: 0,
      };
    }
    console.log("Sender " + this.uid + " validated.");
    // return this.compareConciseArrays(
    //   conciseSenderHistory,
    //   conciseReceiverHistory
    // );
  }

  // compareConciseArrays(arr1, arr2) {
  //   if (arr1.length !== arr2.length) return false;
  //   if (arr1 == null || arr2 == null) return false;
  //   const length = arr1.length;
  //   for (let i = 0; i < length; i++) {
  //     if (arr1[i][0] !== arr1[i][0] || arr1[i][1] !== arr1[i][1]) return false;
  //   }
  //   return true;
  // }
  removeRedundantEntries(history) {
    if (history.length <= 1) {
      return history;
    }
    let highIndex = 1;
    while (
      history[0][0] === history[highIndex][0] &&
      history[0][1] === history[highIndex][1]
    ) {
      highIndex++;
      if (highIndex === history.length) {
        return [history[0]];
      }
    }
    const recursiveReturn = this.removeRedundantEntries(
      history.slice(highIndex, history.length)
    );

    recursiveReturn.unshift(history[0]);
    return recursiveReturn;
  }
  validateRestOfHistory(receiverHistory) {
    let receiverHistoryIndex = 0;
    let senderHistoryIndex = 0;

    while (
      senderHistoryIndex + 1 < this.sendHistory.length &&
      this.sendHistory[senderHistoryIndex] ===
        this.sendHistory[senderHistoryIndex + 1]
    ) {
      senderHistoryIndex++;
    }

    while (
      receiverHistoryIndex < receiverHistory.length &&
      this.sendHistory[senderHistoryIndex] ===
        receiverHistory[receiverHistoryIndex]
    ) {
      senderHistoryIndex++;
    }
  }
  shutDown() {
    this.socket.disconnect();
    if (this.interval != null) {
      clearInterval(this.interval);
      clearTimeout(this.timeout);
      console.error("ERROR: Sender was not done sending at shutDown");
    }
  }
}
module.exports = Sender;
