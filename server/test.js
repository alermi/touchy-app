// If setting this to false, make sure the backend server is already started.
const LOCAL_TEST = true;
// const LOCAL_TEST = false;

const DEFAULT_X_VALUE = 0;
const DEFAULT_Y_VALUE = 0;
const DEFAULT_IS_ACTIVE_VALUE = false;
const io = require('socket.io-client');
const assert = require('assert');

let serverURL;
if(LOCAL_TEST){
  // Server setup
  var app = require('./app');
  var http = require('http');
  var port = 8080;
  app.set('port', port);
  var server = http.createServer(app);
  var ConnectionHandler = require('./src/connectionHandler');
  const connectionHandler = new ConnectionHandler(server);
  server.listen(port);
  app.set('server', server);
  serverURL = "http://localhost:" + port + "/";
}
else{
  serverURL = "https://touchy-backend.azurewebsites.net";
}

describe('Single sender single receiver', function() {
  this.timeout(10000); 
  let ioSend;
  let ioReceive;
  
  beforeEach(() => {
      if(ioReceive == null || !ioReceive.connected){
        ioReceive = io(serverURL);
      }
      if(ioSend == null || !ioSend.connected){
        ioSend = io(serverURL);
      }
  });

  afterEach(() => {
    if(ioSend.connected){
      ioSend.close();
    }
    if(ioReceive.connected){
      ioReceive.close();
    }

  });
  after(() => {
    if(LOCAL_TEST){
      server.close();
    }
  })

  it('Send and receive single random datapoint', done => {
    // Get random x and y to send out and receive
    const randX = Math.random();
    const randY = Math.random();

    ioReceive.on('connect', () => {
      ioReceive.emit('joinReceivers');
    });
    let receivedValidMessage = false;
    ioReceive.on('message', data => {
      if(!receivedValidMessage && data[3] == true){
        assert.strictEqual(data[0], ioSend.id);
        assert.strictEqual(data[1], randX);
        assert.strictEqual(data[2], randY);
        receivedValidMessage = true;
        return;
      }
      else if(receivedValidMessage){
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

    ioSend.on('connect', () => {
      ioSend.send([randX, randY]);
    });
  });

it('Ignore invalid messages', done => {
    ioReceive.on('connect', () => {
      ioReceive.emit('joinReceivers');
    });

    let numMessagesReceived = 0;
    ioReceive.on('message', data => {
      numMessagesReceived++;
      assert.strictEqual(data[0], ioSend.id);
      assert.strictEqual(data[1], DEFAULT_X_VALUE);
      assert.strictEqual(data[2], DEFAULT_Y_VALUE);
      assert.strictEqual(data[3], DEFAULT_IS_ACTIVE_VALUE);
      if(numMessagesReceived == 10){
        ioReceive.close();
        ioSend.close();
        done();
      }
    });

    ioSend.on('connect', () => {
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
      for(let i = 0; i < 12; i++){
        longString += longString;
      }
      ioSend.send([longString, longString]);
    });
  });
});