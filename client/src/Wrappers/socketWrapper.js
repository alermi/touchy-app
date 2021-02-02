import { io } from "socket.io-client";

class SocketWrapper {
  constructor() {
    this.socket = false;
  }

  initialize(token, handleNewLogin, stubbornRefresh, setConnected) {
    //TODO: Delete log
    if (!!this.socket) {
      console.log(
        "At initialize, socket was already initialized. Cleaning up first."
      );
      this.cleanUp();
    }
    console.log(
      "Initializing socket with server url: " + process.env.REACT_APP_SERVER_URL
    );
    this.socket = io(process.env.REACT_APP_SERVER_URL, {
      query: {
        socketType: "sender",
      },
      auth: {
        token: token,
      },
    });
    this.socket.on("connect", () => {
      console.log("Connected to server socket.io.");
      setConnected(true);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Disconnected from server socket.io. Reason: " + reason);
      setConnected(false);
    });

    this.socket.on("newLogIn", () => {
      console.log("Logged in with another socket.");
      handleNewLogin();
    });

    this.socket.on("error", (err) => {
      console.log("Socket error: " + err.message);
    });

    this.socket.on("connect_error", (err) => {
      console.log("Socket connection_error: " + err.message);
      if (err.message === "Authentication failed.") {
        this.cleanUp();
        stubbornRefresh();
      }
    });
  }

  cleanUp() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      console.log("Socket cleaned up");
    }
    this.socket = false;
  }

  send(data) {
    if (this.socket && this.socket.connected) {
      this.socket.send(data);
    }
  }

  addEventListener(event, listener) {
    this.socket.on(event, listener);
  }

  removeAllListenersOfEvent(event) {
    this.socket.off(event);
  }

  sendUpgradeRequest(email, role) {
    this.socket.emit("upgradeRequest", email, role);
  }

  getToken() {
    if (!!this.socket) {
      return this.socket.io.opts.auth.token;
    } else {
      return null;
    }
  }

  setToken(token) {
    if (!!this.socket) {
      this.socket.io.opts.auth = {
        token: token,
      };
    } else {
      console.log(
        "ERROR: setToken in SocketWrapper was called but socket was false"
      );
    }
  }
}

// const socketWrapper = new SocketWrapper();
export default SocketWrapper;
