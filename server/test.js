// Server setup
var app = require('./app');
var http = require('http');
var port = 8080;
app.set('port', port);
var server = http.createServer(app);
var ConnectionHandler = require('./src/connectionHandler');
const io = require('socket.io-client');
const connectionHandler = new ConnectionHandler(server);
server.listen(port);
app.set('server', server);

var assert = require('assert');


const serverURL = "http://localhost:" + port + "/";
describe('Our application', function() {

  // This is the name of the test
  it('should be able to receive a basic coordinate message and then receive invalid messages with same coordinate', function(done) {
    const ioReceive = io(serverURL);
    ioReceive.on('connect', () => {
      ioReceive.emit('joinReceivers');
    });
    var receivedValidMessage = false;
    ioReceive.on('message', data => {
      if(!receivedValidMessage && data[3] == true){
        assert.strictEqual(data[0], ioSend.id);
        assert.strictEqual(data[1], 0);
        assert.strictEqual(data[2], 0.5);
        receivedValidMessage = true;
        console.log("ioReceive received message " + data);
        return;
      }
      if(receivedValidMessage == true){
        assert.strictEqual(data[0], ioSend.id);
        assert.strictEqual(data[1], 0);
        assert.strictEqual(data[2], 0.5);
        assert.strictEqual(data[3], false);
        console.log("ioReceive received message " + data);
        console.log("Closing ioReceive");
        ioReceive.close();
        done();
        return;
      }
    });

    const ioSend = io(serverURL);
    ioSend.send([0, 0.5]);
    setTimeout(function(){ ioSend.close();}, 1000);
  });

  after(function(){
    server.close();
  })  

});