const maxApi = require('max-api');
const io = require('socket.io-client');
const dotenv = require('dotenv');
dotenv.config();

const socket = io(process.env.BACKEND_URL);    

const DATA_PER_USER = 5;

socket.on('connect', () => {
    socket.emit('joinReceivers');
});

socket.on('message', (data) => {
    if(!Array.isArray(data)){
        console.log("WARNING: Data received that is not an array. Ignored.");
        return;
    }
    if(data.length % 5 != 0){
        console.log("WARNING: Data size is not divisible by " + DATA_PER_USER + ". Ignored.");
        return;
    }
    var dict = {};
    for(var i = 0; i < data.length; i+=DATA_PER_USER){
        var userId = data[i];
        var x = data[i + 1];
        var y = data[i + 2];
        var isActive = data[i + 3];
        var timeStamp = data[i + 4];
        if(!userId instanceof String){
            console.log("WARNING: Invalid user id received. Datapoint ignored.")
            continue;
        }
        if(typeof x != 'number' || typeof y != 'number'){
            console.log("WARNING: Invalid coordinates received. Datapoint ignored.");
            continue;
        }
        if(typeof isActive != 'boolean'){
            console.log("WARNING: Invalid isActive received. Datapoint ignored.");
        }
        if(typeof timeStamp != 'number' || timeStamp < 1608932911991){
            console.log("WARNING: Invalid timeStamp received. Datapoint ignored.");
        }
        if(x < 0.0) x = 0.0;
        if(x > 1.0) x = 1.0;
        if(y < 0.0) y = 0.0;
        if(y > 1.0) y = 1.0;
        dict[userId] = [x, y, isActive, timeStamp];
    }
    maxApi.outlet(dict);
    
});
