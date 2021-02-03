// If setting this to false, make sure the backend server is already started and running in development mode.
const LOCAL_TEST = true;
// const LOCAL_TEST = false;

const NORMAL_SEND_INTERVAL = 1000 / 5;
const FAST_SEND_INTERVAL = 1000 / 20;

const SocketManager = require("./SocketManager");
const assert = require("assert");

var LoadTestAccountGenerator = require("./LoadTestAccountGenerator");

let socketManager;
let tokenGenerator;
let serverURL;
let server;
let connectionHandler;
let socketIdToUidMap;
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
    let isDevelopment = app.get("env");
    var ConnectionHandler = require("../../src/connectionHandler");
    connectionHandler = new ConnectionHandler(server, auth, 5, 100, true);
    socketIdToUidMap = new Map();

    server.listen(port);
    app.set("server", server);
    serverURL = "http://localhost:" + port + "/";
  } else {
    serverURL = "https://touchy-backend.azurewebsites.net";
  }

  tokenGenerator = new LoadTestAccountGenerator(9);
  socketManager = new SocketManager(serverURL, tokenGenerator);
});

after(() => {
  if (LOCAL_TEST) {
    server.close();
  }
});

describe("Load Test", function () {
  this.timeout(100000);
  const numSenders = 2;
  const numReceivers = 2;
  before(async () => {
    await socketManager.addSenders(numSenders);
    await socketManager.addReceivers(numReceivers);
  });
  after(() => {
    socketManager.shutDownAll();
  });

  it("Send and receive single random datapoint", (done) => {
    socketManager.send(2, 2000, NORMAL_SEND_INTERVAL);
    setTimeout(() => {
      socketManager.validate();
      done();
    }, 5000);
  });
});
