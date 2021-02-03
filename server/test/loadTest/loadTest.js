// If setting this to false, make sure the backend server is already started and running in FIREBASE_ENV=development
// and EMAIL_UID=true mode.
const LOCAL_TEST = true;
// const LOCAL_TEST = false;

const NORMAL_SEND_INTERVAL = 1000 / 5;
const FAST_SEND_INTERVAL = 1000 / 20;

const SENDER_NUM_LIMIT = 100;
const SocketManager = require("./SocketManager");
const assert = require("assert");

var LoadTestAccountGenerator = require("./LoadTestAccountGenerator");

let socketManager;
let tokenGenerator;
let serverURL;
let server;
let connectionHandler;
//TODO: Remove the authorization from senders and test the rejection of sockets.
before(() => {
  if (LOCAL_TEST) {
    // Server setup
    var app = require("../../app");
    var http = require("http");
    var port = 8080;
    app.set("port", port);
    server = http.createServer(app);
    var Authenticator = require("../../src/auth");
    const auth = new Authenticator();
    var ConnectionHandler = require("../../src/connectionHandler");
    connectionHandler = new ConnectionHandler(server, auth, true);

    server.listen(port);
    app.set("server", server);
    serverURL = "http://localhost:" + port + "/";
  } else {
    serverURL = "https://touchy-backend.azurewebsites.net";
  }
  console.log("Server URL: " + serverURL);
  tokenGenerator = new LoadTestAccountGenerator(SENDER_NUM_LIMIT);
  socketManager = new SocketManager(serverURL, tokenGenerator);
});

after(() => {
  if (LOCAL_TEST) {
    server.close();
  }
});

describe("Load Test", function () {
  const numSenders = SENDER_NUM_LIMIT;
  const numReceivers = 2;
  this.timeout(1000 * 60 * 60); // 1h
  before(async () => {
    await socketManager.addReceivers(numReceivers);
    await socketManager.addSenders(numSenders);
    console.log("Before Ended");
    return Promise.resolve();
  });
  after(() => {
    socketManager.shutDownAll();
  });

  it("Normal send interval", (done) => {
    const numVals = 10;
    const msPerNum = 5000;
    //Timeout for all sockets to be connected
    setTimeout(() => {
      socketManager.send(numVals, msPerNum, NORMAL_SEND_INTERVAL);
      // Timeout for all sending and receiving to be done
      setTimeout(() => {
        socketManager.validate();
        done();
      }, numVals * msPerNum + 10000);
    }, 30000);
  });
});
