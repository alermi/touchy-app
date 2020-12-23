const maxApi = require('max-api');
const io = require('socket.io-client');

var socket;

maxApi.addHandler('connect', (url) => {
    socket = io(url);
    
    socket.emit('joinReceivers');

    socket.on('message', (data) => {
        if(Array.isArray(data)){
            maxApi.outlet(data);
        }
    })
})

maxApi.addHandler('disconnect', () => {
    if(socket != null){
        socket.close();
    }
})

