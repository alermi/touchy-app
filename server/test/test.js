// If setting this to false, make sure the backend server is already started.
const LOCAL_TEST = true;
// const LOCAL_TEST = false;
const SOCKET_TYPE_RECEIVER = 'receiver';
const SOCKET_TYPE_SENDER = 'sender';
const DEFAULT_X_VALUE = 0;
const DEFAULT_Y_VALUE = 0;
const DEFAULT_IS_ACTIVE_VALUE = false;
const io = require('socket.io-client');
const assert = require('assert');

const WAIT_TIME_TO_BE_REGISTERED = 50;

var TokenGenerator = require('./tokenGenerator');
let tokenGenerator = new TokenGenerator(LOCAL_TEST);

let serverURL;
let server;
let connectionHandler;
before(() => {
  if (LOCAL_TEST) {
    // Server setup
    var app = require('../app');
    var http = require('http');
    var port = 8080;
    app.set('port', port);
    server = http.createServer(app);
    var MockAuthenticator = require('./mockAuth');
    const mockAuth = new MockAuthenticator();
    var ConnectionHandler = require('../src/connectionHandler');
    connectionHandler = new ConnectionHandler(server, mockAuth, 5, 100);

    server.listen(port);
    app.set('server', server);
    serverURL = "http://localhost:" + port + "/";
  }
  else {
    serverURL = "https://touchy-backend.azurewebsites.net";
  }
})

after(() => {
  if (LOCAL_TEST) {
    server.close();
  }
})

describe('Single sender single receiver, sender connects first', function () {
  this.timeout(10000);
  let ioSend;
  let ioReceive;

  beforeEach(() => {
    if (ioSend == null || !ioSend.connected) {
      ioSend = io(serverURL, {
        query: {
          socketType: SOCKET_TYPE_SENDER
        },
        auth: {
          token: tokenGenerator.getNextToken()
        }
      });
    }

    if (ioReceive == null || !ioReceive.connected) {
      ioReceive = io(serverURL, {
        query: {
          socketType: SOCKET_TYPE_RECEIVER
        }
      });
    }
  });

  afterEach(() => {
    tokenGenerator.reset();
    if (ioSend.connected) {
      ioSend.close();
    }
    if (ioReceive.connected) {
      ioReceive.close();
    }
    tokenGenerator.reset();
  });


  it('Send and receive single random datapoint', done => {
    // Get random x and y to send out and receive
    const randX = Math.random();
    const randY = Math.random();
    setTimeout(() => {
      ioSend.send([randX, randY]);
    }, WAIT_TIME_TO_BE_REGISTERED);

    let receivedValidMessage = false;
    ioReceive.on('message', data => {
      if (!receivedValidMessage && data[3] == true) {
        assert.strictEqual(data[0], ioSend.id);
        assert.strictEqual(data[1], randX);
        assert.strictEqual(data[2], randY);
        receivedValidMessage = true;
        return;
      }
      else if (receivedValidMessage) {
        assert.strictEqual(data[0], ioSend.id);
        assert.strictEqual(data[1], randX);
        assert.strictEqual(data[2], randY);
        assert.strictEqual(data[3], false);
        ioReceive.close();
        ioSend.close();
        done();
        return;
      }
    });
  });

  it('Ignore invalid messages', done => {
    let numMessagesReceived = 0;
    ioReceive.on('message', data => {
      numMessagesReceived++;
      assert.strictEqual(data[0], ioSend.id);
      assert.strictEqual(data[1], DEFAULT_X_VALUE);
      assert.strictEqual(data[2], DEFAULT_Y_VALUE);
      assert.strictEqual(data[3], DEFAULT_IS_ACTIVE_VALUE);
      if (numMessagesReceived == 10) {
        ioReceive.close();
        ioSend.close();
        done();
      }
    });

    setTimeout(() => {
      // Invalid messages
      ioSend.send([0, 2]);
      ioSend.send([-1, 0.5]);
      ioSend.send([0.5]);
      ioSend.send([0, 0, 0]);
      ioSend.send(["Hi", 0, 0]);
      ioSend.send([-999999999999999999, 0.5]);
      ioSend.send([0, true]);
      ioSend.send(["hi", 1]);
      ioSend.send(["hi", "there"]);
      let longString = "This is a long string";
      for (let i = 0; i < 12; i++) {
        longString += longString;
      }
      ioSend.send([longString, longString]);
    }, WAIT_TIME_TO_BE_REGISTERED);
  });

  it('Ignore messages sent by a receiver', done => {
    // Get random x and y to send out and receive
    const randX = Math.random();
    const randY = Math.random();

    let receivedValidMessage = false;
    setTimeout(() => {
      ioSend.send([randX, randY]);
    }, WAIT_TIME_TO_BE_REGISTERED);

    ioReceive.on('message', data => {
      //Send a message back, should be ignored and we should receive the expected messages
      ioReceive.send([0.5, 0.5]);
      if (!receivedValidMessage && data[3] == true) {
        assert.strictEqual(data[0], ioSend.id);
        assert.strictEqual(data[1], randX);
        assert.strictEqual(data[2], randY);
        receivedValidMessage = true;
        return;
      }
      else if (receivedValidMessage) {
        assert.strictEqual(data[0], ioSend.id);
        assert.strictEqual(data[1], randX);
        assert.strictEqual(data[2], randY);
        assert.strictEqual(data[3], false);
        ioReceive.close();
        ioSend.close();
        done();
        return;
      }
    });
  });

  it('Ignore multiple requests to join receivers', done => {
    // Extra join receivers request
    // ioReceive.emit('joinReceivers');
    // Get random x and y to send out and receive
    const randX = Math.random();
    const randY = Math.random();
    setTimeout(() => {
      ioSend.send([randX, randY]);
    }, WAIT_TIME_TO_BE_REGISTERED);

    let receivedValidMessage = false;
    ioReceive.on('message', data => {
      // Extra join receivers request
      // ioReceive.emit('joinReceivers');
      if (!receivedValidMessage && data[3] == true) {
        assert.strictEqual(data[0], ioSend.id);
        assert.strictEqual(data[1], randX);
        assert.strictEqual(data[2], randY);
        receivedValidMessage = true;
        return;
      }
      else if (receivedValidMessage) {
        assert.strictEqual(data[0], ioSend.id);
        assert.strictEqual(data[1], randX);
        assert.strictEqual(data[2], randY);
        assert.strictEqual(data[3], false);
        ioReceive.close();
        ioSend.close();
        done();
        return;
      }
    });
  });
});

describe('Single sender single receiver, receiver connects first', function () {
  this.timeout(10000);
  let ioSend;
  let ioReceive;

  afterEach(() => {
    tokenGenerator.reset();
    if (ioSend.connected) {
      ioSend.close();
    }
    if (ioReceive.connected) {
      ioReceive.close();
    }
  });

  it('Send and receive single random datapoint', done => {
    // Get random x and y to send out and receive
    const randX = Math.random();
    const randY = Math.random();
    if (ioReceive == null || !ioReceive.connected) {
      ioReceive = io(serverURL, {
        query: {
          socketType: SOCKET_TYPE_RECEIVER
        }
      });
    }
    setTimeout(() => {
      if (ioSend == null || !ioSend.connected) {
        ioSend = io(serverURL, {
          query: {
            socketType: SOCKET_TYPE_SENDER
          },
          auth: {
            token: tokenGenerator.getNextToken()
          }
        });
      }
      ioSend.on('connect', () => {
        setTimeout(() => {
          ioSend.send([randX, randY]);
        }, WAIT_TIME_TO_BE_REGISTERED)
      });
    }, 1000)

    let receivedValidMessage = false;
    ioReceive.on('message', data => {
      // This should have no affect since we are already receiving messages
      if (LOCAL_TEST) {
        connectionHandler.startSending();
      }
      if (!receivedValidMessage && data[3] == true) {
        assert.strictEqual(data[0], ioSend.id);
        assert.strictEqual(data[1], randX);
        assert.strictEqual(data[2], randY);
        receivedValidMessage = true;
        return;
      }
      else if (receivedValidMessage) {
        assert.strictEqual(data[0], ioSend.id);
        assert.strictEqual(data[1], randX);
        assert.strictEqual(data[2], randY);
        assert.strictEqual(data[3], false);
        ioReceive.close();
        ioSend.close();
        done();
        return;
      }
    });
  });

  it('Ignore invalid messages', done => {
    if (ioReceive == null || !ioReceive.connected) {
      ioReceive = io(serverURL, {
        query: {
          socketType: SOCKET_TYPE_RECEIVER
        }
      });
    }
    setTimeout(() => {
      if (ioSend == null || !ioSend.connected) {
        ioSend = io(serverURL, {
          query: {
            socketType: SOCKET_TYPE_SENDER
          },
          auth: {
            token: tokenGenerator.getNextToken()
          }
        });
      }
      ioSend.on('connect', () => {
        setTimeout(() => {
          // Invalid messages
          ioSend.send([0, 2]);
          ioSend.send([-1, 0.5]);
          ioSend.send([0.5]);
          ioSend.send([0, 0, 0]);
          ioSend.send(["Hi", 0, 0]);
          ioSend.send([-999999999999999999, 0.5]);
          ioSend.send([0, true]);
          ioSend.send(["hi", 1]);
          ioSend.send(["hi", "there"]);
          let longString = "This is a long string";
          for (let i = 0; i < 12; i++) {
            longString += longString;
          }
          ioSend.send([longString, longString]);
        }, WAIT_TIME_TO_BE_REGISTERED)
      });
    }, 1000)

    let numMessagesReceived = 0;
    ioReceive.on('message', data => {
      numMessagesReceived++;
      assert.strictEqual(data[0], ioSend.id);
      assert.strictEqual(data[1], DEFAULT_X_VALUE);
      assert.strictEqual(data[2], DEFAULT_Y_VALUE);
      assert.strictEqual(data[3], DEFAULT_IS_ACTIVE_VALUE);
      if (numMessagesReceived == 10) {
        ioReceive.close();
        ioSend.close();
        done();
      }
    });
  });
});

describe('Single receiver, no senders', function () {
  this.timeout(11000);
  it('The receiver should not receive any messages', (done) => {
    let ioReceive = io(serverURL, {
      query: {
        socketType: SOCKET_TYPE_RECEIVER
      }
    });

    ioReceive.on('message', data => {
      throw new Error('The receiver should not have received any messages since there are no senders');
    });

    if (LOCAL_TEST) {
      setTimeout(() => {
        // This should not do anything since there are no senders.
        connectionHandler.sendDataToReceivers();
      }, 3000)
      setTimeout(() => {
        // This should not do anything since we already shouldnt be sending.
        connectionHandler.stopSending();
      }, 7000)
    }

    setTimeout(() => {
      if (LOCAL_TEST) {
        if (connectionHandler.interval != false) {
          throw new Error('The interval should be false since there are no senders');
        }
      }
      ioReceive.close();
      done();
    }, 9000)
  })
})

describe('Multiple receivers, no senders', function () {
  this.timeout(10000);
  it('The receivers should not receive any messages', (done) => {
    let ioReceive1 = io(serverURL, {
      query: {
        socketType: SOCKET_TYPE_RECEIVER
      }
    });
    let ioReceive2 = io(serverURL, {
      query: {
        socketType: SOCKET_TYPE_RECEIVER
      }
    });

    ioReceive1.on('message', data => {
      throw new Error('The receiver should not have received any messages since there are no senders');
    });

    ioReceive2.on('message', data => {
      throw new Error('The receiver should not have received any messages since there are no senders');
    });

    if (LOCAL_TEST) {
      setTimeout(() => {
        // This should not do anything since there are no senders.
        connectionHandler.sendDataToReceivers();
      }, 3000)
    }

    setTimeout(() => {
      if (LOCAL_TEST) {
        if (connectionHandler.interval != false) {
          throw new Error('The interval should be false since there are no senders');
        }
      }
      ioReceive1.close();
      ioReceive2.close();
      done();
    }, 5000)
  })
})

describe('Multiple senders, multiple receivers', function () {
  this.timeout(30000);
  const sendersCount = 100;
  const receiversCount = 5;
  var senders;
  var receivers;

  beforeEach(() => {
    senders = [];
    for (let i = 0; i < sendersCount; i++) {
      let tempSender = io(serverURL, {
        query: {
          socketType: SOCKET_TYPE_SENDER
        },
        auth: {
          token: tokenGenerator.getNextToken()
        }
      });
      senders.push({
        socket: tempSender,
        lastSentX: null,
        lastSentY: null
      });
    }
    receivers = [];
    for (let i = 0; i < receiversCount; i++) {
      let tempReceiver = io(serverURL, {
        query: {
          socketType: SOCKET_TYPE_RECEIVER
        }
      });

      receivers.push(tempReceiver);
    }
  });

  afterEach(() => {
    tokenGenerator.reset();
    for (let i = 0; i < sendersCount; i++) {
      if (senders[i].socket.connected) {
        senders[i].socket.close();
      }
    }
    for (let i = 0; i < receiversCount; i++) {
      if (receivers[i].connected) {
        receivers[i].close();
      }
    }
  });

  it('Receive proper messages from all senders', (done) => {

    //This should execute after all the senders have connected hopefully
    setTimeout(() => {
      for (let i = 0; i < senders.length; i++) {
        if (senders[i].socket.connected) {
          const randX = Math.random();
          const randY = Math.random();
          senders[i].socket.send([randX, randY]);
          senders[i].lastSentX = randX;
          senders[i].lastSentY = randY;
        } else {
          throw new Error("Sender " + i + " not yet connected when tried to send messages");
        }
      }
    }, 10000)
    setTimeout(() => {
      let receivedValidMessagesCount = 0;
      for (let i = 0; i < receiversCount; i++) {
        receivers[i].on('message', data => {
          let receivedMap = convertMessageToMap(data, senders);
          assert.strictEqual(receivedMap.size, sendersCount);

          for (j = 0; j < sendersCount; j++) {
            let currSenderEntry = senders[j];
            assert.strictEqual(currSenderEntry.lastSentX, receivedMap.get(currSenderEntry.socket.id).x);
            assert.strictEqual(currSenderEntry.lastSentY, receivedMap.get(currSenderEntry.socket.id).y);
          }
          receivedValidMessagesCount++;
          // Stop when we received 10 messages per receiver.
          // TODO: Check if all receivers actually received messages
          if (receivedValidMessagesCount == (receiversCount * 10)) {
            senders.forEach((sender) => { sender.socket.close(); });
            receivers.forEach((receiver) => { receiver.close(); });
            done();
          }
        });
      }
    }, 14000)
  });
});

convertMessageToMap = (list, senders) => {
  if (list.length % 5 != 0) {
    throw new Error("Asked to convert a list that does not have a valid size");
  }
  let senderIds = [];
  senders.forEach((sender) => senderIds.push(sender.socket.id));
  var returnMap = new Map();
  for (let i = 0; i < list.length; i += 5) {
    let senderId = list[i];
    if (!senderIds.includes(senderId)) {
      throw new Error("Sender id in list is not in our senders list.");
    }
    let x = list[i + 1];
    let y = list[i + 2];
    let isActive = list[i + 3];
    let timeStamp = list[i + 4];
    returnMap.set(senderId, {
      x: x,
      y: y,
      isActive: isActive,
      timeStamp: timeStamp
    });
  }
  return returnMap;
}