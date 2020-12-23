const maxApi = require('max-api');
const io = require('socket.io-client');

var socket;

maxApi.addHandler('connect', (url) => {
    socket = io(url);
    
    socket.emit('joinReceivers');

    socket.on('message', (data) => {
        maxApi.outlet('coordinateUpdates', data);
    })
})

maxApi.addHandler('disconnect', () => {
    if(socket != null){
        socket.close();
    }
})

