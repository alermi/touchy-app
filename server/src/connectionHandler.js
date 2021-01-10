const RECEIVER_CHANNEL_NAME = 'receivers-room';
var admin = require('firebase-admin');
var serviceAccount = require("../serviceAccountKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

class ConnectionData {
    constructor(connectionTime, lastX, lastY, isActive){
        this.connectionTime = connectionTime;
        this.lastX = lastX;
        this.lastY = lastY;
        this.isActive = isActive;
    }
}

class ConnectionHandler{
    constructor(server, maxReceiversCount, maxSendersCount){
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
        this.currReceiversCount = 0;
        this.currSendersCount = 0;
        this.maxReceiversCount = maxReceiversCount;
        this.maxSendersCount = maxSendersCount;
    }

    handleNewConnection(socket){
        //TODO: Check max connection count
        //TODO: Maybe move these checks into the join request methods. Maybe not. Since we will be adding to the wait list, might get messy
        if(this.sendersMap.has(socket.id)){
            console.log("WARNING: Sender " + socket.id + " tried to connect again. Closing connection.");
            this.cleanSenderSocketData(socket, true);
            socket.disconnect(true);
            return;
        }

        if(this.receivers.includes(socket.id)){
            console.log("WARNING: Receiver " + socket.id + " tried to connect again. Closing connection.");
            this.cleanReceiverSocketData(socket, true);
            socket.disconnect(true);
            return;
        }

        let query = socket.handshake.query;
        var socketType = query['socketType'];
        switch(socketType){
            case 'receiver':
                this.handleJoinReceiversRequest(socket);  
                break;
            case 'sender':
                this.handleJoinSendersRequest(socket);  
                break;
            default:
                console.log("New connection socketType query did not match either options. Disconnecting.");
                socket.disconnect();
                return;
        }

        console.log('Client ' + socket.id + ' connected');

        socket.on('message', data => {
            this.handleNewMessage(socket, data);
        });
        
        
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
        //TODO: Check handshake query type and remove from that structure instead of calling
        // unknown type clean. Delete unknown type clean.
        this.cleanUnknownTypeSocketData(socket, true);
        if(!this.checkIfShouldSend() && this.interval != false){
            this.stopSending();
        }
        console.log('Client ' + socket.id + ' disconnected for reason: ' + reason);
    }

    handleJoinSendersRequest(socket){
        if(this.currSendersCount >= this.maxSendersCount){
            if(this.currSendersCount > this.maxSendersCount){ console.log("ERROR: Current senders count is greater than maximum allowed.")};
            console.log("Socket " + socket.id + " tried to join senders but was rejected because receivers are full.");
            socket.disconnect();
            return;
        }

        this.currSendersCount++;
        this.sendersMap.set(socket.id, new ConnectionData(Date.now(), 0, 0, false));
        if(this.checkIfShouldSend() && this.interval == false){
            this.startSending();
        }
        console.log('Client ' + socket.id + ' joined senders');
    }

    handleJoinReceiversRequest(socket){
        if(this.currReceiversCount >= this.maxReceiversCount){
            if(this.currReceiversCount > this.maxReceiversCount){ console.log("ERROR: Current receivers count is greater than maximum allowed.")};
            console.log("Socket " + socket.id + " tried to join receivers but was rejected because receivers are full.");
            socket.disconnect();
            return;
        }
        this.currReceiversCount++;
        this.receivers.push(socket.id);
        console.log('Client ' + socket.id + ' joined receivers');

        socket.join(RECEIVER_CHANNEL_NAME);

        //TODO: Fix the rest of this method
        if(this.checkIfShouldSend() && this.interval == false){
            this.startSending();
        }
        // //TODO: Consider getting rid of else if.
        // else if(!this.checkIfShouldSend() && this.interval != false){
        //     this.stopSending();
        // }
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

    cleanReceiverSocketData(socket, shouldExist){
        if(this.receivers.includes(socket.id)){
            let index = this.receivers.indexOf(socket.id);
            this.receivers.splice(index, 1);
            this.currReceiversCount--;
            return true;
        }
        else if(shouldExist){
            console.log("WARNING: Tried to clean receiver data that was expected to exist but did not.");
        }
        return false;
    }

    cleanSenderSocketData(socket, shouldExist){
        if(this.sendersMap.has(socket.id)){
            this.sendersMap.delete(socket.id);
            this.currSendersCount--;
            return true;
        }
        else if(shouldExist){
            console.log("WARNING: Tried to clean receiver data that was expected to exist but did not.");
        }
        return false;
    }
    
    cleanUnknownTypeSocketData(socket, shouldExist){
        let timesFound = 0;
        if(this.cleanSenderSocketData(socket, false)) timesFound++;
        if(this.cleanReceiverSocketData(socket, false)) timesFound++;
        if(timesFound > 1){
            console.log("WARNING: cleanUnknownTypeSocketData found the socket in more than one data structure.");
        }
        if(shouldExist && timesFound == 0){
            console.log("WARNING: Tried to clean unknown type socket " + socket.id + " data that was expected to exist but did not.");
        }
    }
}

module.exports = ConnectionHandler;