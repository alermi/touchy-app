// If setting this to true, make sure the backend server is already started.
const LOCAL_TEST = true;
// const LOCAL_TEST = false;

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

describe('Our application', function() {
  if(!LOCAL_TEST){
    this.timeout(10000); 
  }
  let ioSend;
  let ioReceive;
  it('should be able to receive a basic coordinate message and then receive invalid messages with same coordinate', function(done) {
    // Get random x and y to send out and receive
    const randX = Math.random();
    const randY = Math.random();
    ioReceive = io(serverURL);
    ioSend = io(serverURL);
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
        done();
        return;
      }
    });

    ioSend.on('connect', () => {
      ioSend.send([randX, randY]);
    });
  });

  after(function(){
    if(ioSend.connected){
      ioSend.close();
    }
    if(ioReceive.connected){
      ioReceive.close();
    }
    if(LOCAL_TEST){
      server.close();
    }
  })  

});