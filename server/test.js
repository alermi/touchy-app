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
  var connectionHandler = new ConnectionHandler(server);
  server.listen(port);
  app.set('server', server);
  serverURL = "http://localhost:" + port + "/";
}
else{
  serverURL = "https://touchy-backend.azurewebsites.net";
}

describe('Single sender single receiver, sender connects first', function() {
  this.timeout(10000); 
  let ioSend;
  let ioReceive;
  
  beforeEach(() => {
    if(ioSend == null || !ioSend.connected){
      ioSend = io(serverURL);
    }
    if(ioReceive == null || !ioReceive.connected){
      ioReceive = io(serverURL);
      ioReceive.on('connect', () => {
        ioReceive.emit('joinReceivers');
      });
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
  

  it('Send and receive single random datapoint', done => {
    // Get random x and y to send out and receive
    const randX = Math.random();
    const randY = Math.random();
    ioSend.on('connect', () => {
      ioSend.send([randX, randY]);
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
  });

  it('Ignore invalid messages', done => {
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

  it('Ignore messages sent by a receiver', done => {
    // Get random x and y to send out and receive
    const randX = Math.random();
    const randY = Math.random();
    
    let receivedValidMessage = false;
    ioReceive.on('message', data => {
      //Send a message back, should be ignored and we should receive the expected messages
      ioReceive.send([0.5, 0.5]);
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

  it('Ignore multiple requests to join receivers', done => {
    // Extra join receivers request
    ioReceive.emit('joinReceivers');
    // Get random x and y to send out and receive
    const randX = Math.random();
    const randY = Math.random();
    
    let receivedValidMessage = false;
    ioReceive.on('message', data => {
      // Extra join receivers request
      ioReceive.emit('joinReceivers');
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
});

describe('Single sender single receiver, receiver connects first', function() {
  this.timeout(10000); 
  let ioSend;
  let ioReceive;

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
    if(ioReceive == null || !ioReceive.connected){
      ioReceive = io(serverURL);
      ioReceive.on('connect', () => {
        ioReceive.emit('joinReceivers');
      });
    }
    setTimeout(()=>{
      if(ioSend == null || !ioSend.connected){
        ioSend = io(serverURL);
      }
      ioSend.on('connect', () => {
        ioSend.send([randX, randY]);
      });
    }, 1000)

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
  });

  it('Ignore invalid messages', done => {
    if(ioReceive == null || !ioReceive.connected){
      ioReceive = io(serverURL);
      ioReceive.on('connect', () => {
        ioReceive.emit('joinReceivers');
      });
    }
    setTimeout(()=>{
      if(ioSend == null || !ioSend.connected){
        ioSend = io(serverURL);
      }
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
    }, 1000)

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
  });
});

describe('Single receiver, no senders', function() {
  this.timeout(10000);
  it('The receiver should not receive any messages', (done) => {
    let ioReceive = io(serverURL);
    ioReceive.on('connect', () => {
      ioReceive.emit('joinReceivers');
    });

    let receivedValidMessage = false;
    ioReceive.on('message', data => {
      throw new Error('The receiver should not have received any messages since there are no senders');
    });
    setTimeout(() => {
      if(LOCAL_TEST){
        if(connectionHandler.interval != false){
          throw new Error('The interval should be false since there are no receivers');
        }
      }
      ioReceive.close();
      done();
    }, 5000)
  })
})


// describe('Multiple senders, multiple receivers', function() {
//   this.timeout(20000); 
//   const sendersCount = 100;
//   const receiversCount = 2;
//   let senders;
//   let receivers;
  
//   beforeEach(() => {
//     for(let i = 0; i < sendersCount; i++){
      
//     }
//   });

//   afterEach(() => {
//     if(ioSend.connected){
//       ioSend.close();
//     }
//     if(ioReceive.connected){
//       ioReceive.close();
//     }

//   });

// it('Ignore invalid messages', done => {
//     ioReceive.on('connect', () => {
//       ioReceive.emit('joinReceivers');
//     });

//     let numMessagesReceived = 0;
//     ioReceive.on('message', data => {
//       numMessagesReceived++;
//       assert.strictEqual(data[0], ioSend.id);
//       assert.strictEqual(data[1], DEFAULT_X_VALUE);
//       assert.strictEqual(data[2], DEFAULT_Y_VALUE);
//       assert.strictEqual(data[3], DEFAULT_IS_ACTIVE_VALUE);
//       if(numMessagesReceived == 10){
//         ioReceive.close();
//         ioSend.close();
//         done();
//       }
//     });

//     ioSend.on('connect', () => {
//       // Invalid messages
//       ioSend.send([0, 2]);
//       ioSend.send([-1, 0.5]);
//       ioSend.send([0.5]);
//       ioSend.send([0, 0, 0]);
//       ioSend.send(["Hi", 0, 0]);
//       ioSend.send([-999999999999999999, 0.5]);
//       ioSend.send([0, true]);
//       ioSend.send("Te");
//       ioSend.send(["hi", 1]);
//       ioSend.send(["hi", "there"]);
//       let longString = "This is a long string";
//       for(let i = 0; i < 12; i++){
//         longString += longString;
//       }
//       ioSend.send([longString, longString]);
//     });
//   });
// });







// TODO: Add this to the last describe
// after(() => {
//   if(LOCAL_TEST){
//     server.close();
//   }
// })