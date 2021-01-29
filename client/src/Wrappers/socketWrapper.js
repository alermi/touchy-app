import { io } from "socket.io-client";

class SocketWrapper {
    constructor() {
        this.socket = false;

    }

    initialize(token, handleNewLogin, forceRefreshToken) {
        //TODO: Delete log
        console.log("Initializing socket with server url: " + process.env.REACT_APP_SERVER_URL);
        this.socket = io(process.env.REACT_APP_SERVER_URL, {
            query: {
                socketType: 'sender'
            },
            auth: {
                token: token
            }
        });
        this.socket.on('connect', () => {
            console.log("Connected to server socket.io.");
        });

        this.socket.on('disconnect', () => {
            console.log("Disconnected from server socket.io");
            // TODO: Add the check if the internet is on. If not, add an event listener to 
            // window (online) and call forceRefreshToken then.
            forceRefreshToken();
        });

        this.socket.on('newLogIn', () => {
            console.log('Logged in with another socket.');
            handleNewLogin();
        });

        this.socket.on('upgradeResponse', (data) => {
            console.log(data);
        })

        this.socket.on('error', (err) => {
            console.log('Socket error: ' + err.message);
        });

        this.socket.on('connect_error', (err) => {
            console.log('Socket connection_error: ' + err.message);
        });
    }

    disconnect() {
        if (this.socket && this.socket.connected) {
            this.socket.disconnect();
            console.log('Socket disconnected');
        }
        else {
            console.log('Socket disconnect was called but socket was not connected.');
        }
        this.socket = false;
    }

    send(data) {
        if (this.socket && this.socket.connected) {
            this.socket.send(data);
        }
    }

    addEventListener(event, listener) {
        this.socket.on(event, listener);
    }

    sendUpgradeToArtistRequest(email) {
        this.socket.emit('upgradeToArtistRequest', email);
    }

    isConnected() {
        return this.socket.connected;
    }

    setToken(token) {
        this.socket.io.opts.auth = {
            token: token
        }
    }
}

export default SocketWrapper;