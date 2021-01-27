import { io } from "socket.io-client";

class SocketWrapper {
    constructor() {
        this.socket = false;

    }

    initialize(token, history) {
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
            // TODO: Update the token inside the socket so that if it 
            // tries to re-connect, it has an up to date token.
        });

        this.socket.on('newLogIn', () => {
            console.log('Logged in with another socket.');
            history.push('/login');
        });

        this.socket.on('upgradeResponse', (data) => {
            console.log(data);
        })

        this.socket.on('error', (err) => {
            console.log(err);
        });

        this.socket.on('connect_error', (err) => {
            console.log(err);
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

    updateToken(token) {
        this.socket.io.opts.auth = {
            token: token
        }
    }
}

export default SocketWrapper;