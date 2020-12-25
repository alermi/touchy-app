const maxApi = require('max-api');
const io = require('socket.io-client');
const dotenv = require('dotenv');
dotenv.config();

const socket = io(process.env.BACKEND_URL);    
socket.on('connect', () => {
    socket.emit('joinReceivers');
});

socket.on('message', (data) => {
    if(Array.isArray(data)){
        maxApi.outlet(data);
    }
});
