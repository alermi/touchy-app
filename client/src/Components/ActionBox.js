import React, { Component } from "react";
import './ActionBox.css'
import ReactCursorPosition from 'react-cursor-position';
import Cursor from './Cursor';
import { io } from "socket.io-client";

class ActionBox extends Component {
    constructor(props) {
        super(props);
        this.interval = false;
        this.state = {
            activeXProportion: 0,
            activeYProportion: 0,
            isActive: false,
            isPositionOutside: true,
            elementDimensions: {
                width: -1,
                height: -1
            }
        }
        this.onPositionChanged = this.onPositionChanged.bind(this);
        this.onActivationChanged = this.onActivationChanged.bind(this);
        this.handleAuthStateChange = this.handleAuthStateChange.bind(this);
    }

    componentDidMount() {
        this.props.firebase.auth().onAuthStateChanged(this.handleAuthStateChange);
    }

    handleAuthStateChange(user) {
        if (user) {
            console.log('Signed in at actionBox');
            this.handleUserSignIn(user);
        } else {
            console.log('Signed out at actionBox');
            this.cleanUpSocket();
            this.props.history.push('/login');
        }
    }
    cleanUpSocket() {
        if (this.socket && this.socket.connected) {
            this.socket.disconnect();
            console.log('Socket disconnected');
        }
        if (this.interval !== false) {
            clearInterval(this.interval);
            this.interval = false;
            console.log('Cleaned up interval');
        }
    }

    handleUserSignIn(user) {
        this.cleanUpSocket();
        user.getIdToken(/* forceRefresh */ false).then((token) => {
            this.initializeSocket(token);
        });
    }

    initializeSocket(token) {
        //TODO: Delete log
        console.log("Server url: " + process.env.REACT_APP_SERVER_URL);
        this.socket = io(process.env.REACT_APP_SERVER_URL, {
            query: {
                socketType: 'sender'
            },
            auth: {
                token: token
            }
        });
        this.socket.on('connect', () => {
            this.interval = setInterval(() => {
                this.sendData();
            }, 1000 / 5);
            console.log("Connected to server socket.io. Started to send messages");
        });

        this.socket.on('disconnect', () => {
            console.log("Disconnected from server socket.io");
            this.cleanUpSocket();
        });

        this.socket.on('newLogIn', () => {
            console.log('Logged in with another socket.');
            this.props.history.push('/login');
        });

        this.socket.on('connect_error', (err) => {
            console.log(err);
        });

        console.log('Initilized socket');
    }

    sendData() {
        if (!this.socket) {
            return;
        }
        if (!this.state.isPositionOutside && this.state.isActive) {
            let data = [this.state.activeXProportion, this.state.activeYProportion];
            if (this.socket.connected) {
                this.socket.send(data);
            }
        }
    }

    onPositionChanged(e) {
        if (e.elementDimensions != null) {
            this.setState({ elementDimensions: e.elementDimensions })
        }

        this.setState({ isPositionOutside: e.isPositionOutside });
        if (!e.isPositionOutside) {
            let x = e.position.x;
            let y = e.position.y;
            // Set if the elementDimensions have been set previously.
            if (this.state.elementDimensions.width !== -1) {
                this.setState({ activeXProportion: (x / this.state.elementDimensions.width) });
            }
            if (this.state.elementDimensions.height !== -1) {
                this.setState({ activeYProportion: (y / this.state.elementDimensions.height) });
            }
        }
    }

    onActivationChanged(e) {
        this.setState({ isActive: e.isActive });
        if (e.isActive) {
            this.sendData();
        }
    }

    render() {
        return (
            <div className="Action-box">
                <ReactCursorPosition
                    style={{ width: '100%' }}
                    activationInteractionTouch='touch'
                    onPositionChanged={this.onPositionChanged}
                    onActivationChanged={this.onActivationChanged}>
                    <Cursor className="cursor" />
                isActive: {this.state.isActive ? 'true ' : 'false '}  <br />
                isPositionOutside: {this.state.isPositionOutside ? 'true' : 'false'} <br />
                x: {this.state.activeXProportion}  <br />
                y: {this.state.activeYProportion} <br />
                </ReactCursorPosition>
            </div>
        )
    }
}

export default ActionBox;
