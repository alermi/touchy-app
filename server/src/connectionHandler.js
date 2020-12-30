const RECEIVER_CHANNEL_NAME = 'receivers-room';

class ConnectionData {
    constructor(connectionTime, lastX, lastY, isActive){
        this.connectionTime = connectionTime;
        this.lastX = lastX;
        this.lastY = lastY;
        this.isActive = isActive;
    }
}

class ConnectionHandler{
    constructor(server){
        // this.server = server;
        this.receivers = [];
        this.io = require('socket.io')(server, {
            cors: {
              origin: process.env.CLIENT_URL,
              methods: ["GET", "POST"]
            }
        });
        console.log("CORS at " + process.env.CLIENT_URL);

        this.sendersMap = new Map();

        this.io.on('connection', socket => {
            this.handleNewConnection(socket);
        });

        this.interval = false;
    }

    handleNewConnection(socket){
        //TODO: Check max connection count
        if(this.sendersMap.has(socket.id)){
            console.log("WARNING: Sender " + socket.id + " tried to connect again. Closing connection.");
            this.cleanSocketData(socket);
            socket.disconnect(true);
            return;
        }

        if(this.receivers.includes(socket.id)){
            console.log("WARNING: Receiver " + socket.id + " tried to connect again. Closing connection.");
            this.cleanSocketData(socket);
            socket.disconnect(true);
            return;
        }

        this.sendersMap.set(socket.id, new ConnectionData(Date.now(), 0, 0, false));
        if(this.checkIfShouldSend() && this.interval == false){
            this.startSending();
        }

        console.log('Client ' + socket.id + ' connected');

        socket.on('message', data => {
            this.handleNewMessage(socket, data);
        });
        
        socket.on('joinReceivers', () => {
            this.handleJoinReceiversRequest(socket);  
        })
        
        socket.on('disconnect', (reason) => {
            this.handleDisconnect(socket, reason);
        });
    }

    handleNewMessage(socket, data){
        //TODO: Format check
        if(this.receivers.includes(socket.id)){
            console.log("WARNING: A receiver sent a message. Ignored.");
            return;
        }

        if(!this.sendersMap.has(socket.id)){
            console.log("WARNING: Socket that is not in senders or receivers sent a message. Ignored.");
            return;
        }

        if(!this.verifyReceivedDataFormat(data)){
            return;
        }

        let oldConnectionData = this.sendersMap.get(socket.id);
        let newConnectionData = new ConnectionData(oldConnectionData.connectionTime, data[0], data[1], true);
        this.sendersMap.set(socket.id, newConnectionData);
    }

    handleDisconnect(socket, reason){
        this.cleanSocketData(socket);
        if(!this.checkIfShouldSend() && this.interval != false){
            this.stopSending();
        }
        console.log('Client ' + socket.id + ' disconnected for reason: ' + reason);
    }

    handleJoinReceiversRequest(socket){
        if(this.receivers.includes(socket.id)){
            console.log("WARNING: Client " + socket.id + " tried to join receivers but was already in receivers.");
            return;
        }
        else{
            this.receivers.push(socket.id);
            console.log('Client ' + socket.id + ' joined receivers');
        }
        socket.join(RECEIVER_CHANNEL_NAME);

        if(this.sendersMap.has(socket.id)){
            this.sendersMap.delete(socket.id);
        }
        else{
            console.log("WARNING: Client " + socket.id + " joined receivers but was not previously in senders.");
        }

        if(this.checkIfShouldSend() && this.interval == false){
            this.startSending();
        }
        else if(!this.checkIfShouldSend() && this.interval != false){
            this.stopSending();
        }
    }
    /**
     * Cleans the necessary internal data structures for the given socket
     * @param socket 
     */
    cleanSocketData(socket){
        if(this.sendersMap.has(socket.id) && this.receivers.includes(socket.id)){
            console.log("WARNING: While cleaning socket " + socket.id + ", found out that it was both a sender and a receiver.");
        }

        if(this.sendersMap.has(socket.id)){
            this.sendersMap.delete(socket.id);
        }

        if(this.receivers.includes(socket.id)){
            let index = this.receivers.indexOf(socket.id);
            this.receivers.splice(index, 1);
        }
    }

    verifyReceivedDataFormat(data){
        //TODO: Send corrupt data and see if this catches all cases without crashing.
        if( !Array.isArray(data) || data.length != 2 || (typeof data[0] != 'number') || (typeof data[1] != 'number') ){
            console.log("WARNING: Data received is in wrong format.")
            return false;
        }
        if(data[0] > 1 || data[0] < 0 || data[1] > 1 || data[1] < 0){
            console.log("WARNING: Data received is out of range of 0 to 1");
            return false;
        }
        return true;
    }

    sendDataToReceivers(){
        if(this.sendersMap.size <= 0 || this.receivers.length <= 0){
            // Returning, there is no receivers or senders.
            console.log("WARNING: sendDataToReceivers should not have been called since either senders or receivers is empty.");
            return;
        }
        var data = [];
        for(var [key, val] of this.sendersMap){
            if(key == null){
                console.log("WARNING: Key in sendersMap was null");
                continue;
            }

            if(val == null){
                console.log("WARNING: Value of key " + key + " in sendersMap is null.");
                continue;
            }

            if(!val instanceof ConnectionData){
                console.log("WARNING: Value of key " + key + " in sendersMap is not of type ConnectionData. (" + typeof val + ")");
                continue;
            }

            data.push(key);
            data.push(val.lastX);
            data.push(val.lastY);
            data.push(val.isActive);
            data.push(val.connectionTime);
            
            val.isActive = false;
            this.sendersMap.set(key, val);
        }

        this.io.to(RECEIVER_CHANNEL_NAME).emit('message', data);
    }

    checkIfShouldSend(){
        if(this.receivers.length > 0 && this.sendersMap.size > 0){
            return true;
        }
        else return false;
    }

    startSending(){
        if(this.interval != false){
            console.log("WARNING: Interval attempted to start while already running.");
            return;
        }
        this.interval = setInterval(() => {
            this.sendDataToReceivers();
        }, 1000/5);
        console.log("Started sending updates.");
    }

    stopSending(){
        if(this.interval == false){
            console.log("WARNING: Interval attempted to stop while already not running.");
            return;
        }
        clearInterval(this.interval);
        this.interval = false;
        console.log("Stopped sending updates.");
    }
}

module.exports = ConnectionHandler;