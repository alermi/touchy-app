const maxApi = require('max-api');
const io = require('socket.io-client');
const dotenv = require('dotenv');
const firebase = require('firebase');
dotenv.config();

const DATA_PER_USER = 5;

firebase.initializeApp({
    apiKey: 'AIzaSyCz0liPBXblxmbPOLU3hVH-6-nIs4Kr7QU',
    authDomain: 'ait-krea.firebaseapp.com'
})

firebase.auth().onAuthStateChanged(handleAuthStateChange);

var isSignedIn = false;
var socket = null;

function handleAuthStateChange(user) {
    if (user) {
        console.log('Signed in');
        isSignedIn = true;
        if(socket != null){
            console.log('WARNING: Socket was not null at login.');
        }
        user.getIdToken(/* forceRefresh */ false).then((token) => {
            socket = initializeSocket(token);
        });
    } else {
        console.log('Signed out');
        isSignedIn = false;
        if(socket != null && socket.connected){
            socket.disconnect();
        }
        socket = null;
    }
}
maxApi.addHandler('login', () => {
    if(isSignedIn){
        console.log('Already logged in.');
        return;
    }
    //TODO: Check what happens when the receiver also logs in from the same email as sender. Possibly
    // change the regular user signin to password instead of link and require email verification.
    firebase.auth().signInWithEmailAndPassword(process.env.EMAIL, process.env.PASSWORD).catch(error => {
        console.log(error.message);
    })
});

maxApi.addHandler('logout', () => {
    firebase.auth().signOut();
});

function initializeSocket(token){
    const socket = io(process.env.BACKEND_URL, {
        query: {
            socketType: 'receiver'
        },
        auth: {
            token: token
        }
    });
    
    socket.on('connect_error', (err) => {
        console.log(err.message);
    });
    
    socket.on('connect', () => {
        console.log('Socket connected.');
    });
    
    socket.on('disconnect', () => {
        console.log('Socket disconnected.');
    });

    socket.on('message', (data) => {
        if (!Array.isArray(data)) {
            console.log("WARNING: Data received that is not an array. Ignored.");
            return;
        }
        if (data.length % 5 != 0) {
            console.log("WARNING: Data size is not divisible by " + DATA_PER_USER + ". Ignored.");
            return;
        }
        var outputList = [];
        for (var i = 0; i < data.length; i += DATA_PER_USER) {
            var userId = data[i];
            var x = data[i + 1];
            var y = data[i + 2];
            var isActive = data[i + 3];
            var timeStamp = data[i + 4];
            if (!userId instanceof String) {
                console.log("WARNING: Invalid user id received. Datapoint ignored.")
                continue;
            }
            if (typeof x != 'number' || typeof y != 'number') {
                console.log("WARNING: Invalid coordinates received. Datapoint ignored.");
                continue;
            }
            if (typeof isActive != 'boolean') {
                console.log("WARNING: Invalid isActive received. Datapoint ignored.");
                continue;
            }
            if (typeof timeStamp != 'number' || timeStamp < 1608932911991) {
                console.log("WARNING: Invalid timeStamp received. Datapoint ignored.");
                continue;
            }
            if (x < 0.0) x = 0.0;
            if (x > 1.0) x = 1.0;
            if (y < 0.0) y = 0.0;
            if (y > 1.0) y = 1.0;
    
            outputList.push(x + '_' + y + '_' + (isActive ? 1 : 0) + '_' + timeStamp);
        }
        maxApi.outlet(outputList);
    });

    return socket;
}


