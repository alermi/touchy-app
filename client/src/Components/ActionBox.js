import React, { Component } from "react";
import './ActionBox.css'
import ReactCursorPosition from 'react-cursor-position';
import Cursor from './Cursor';
import AdminView from './AdminView';
import SocketWrapper from '../Wrappers/SocketWrapper'

const socket = new SocketWrapper();

class ActionBox extends Component {
    constructor(props) {
        super(props);
        this.interval = null;
        this.unsubscribe = null;
        this.state = {
            user: null,
            isAdmin: false,
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
    
    sendData() {
        if (!this.state.isPositionOutside && this.state.isActive && socket && socket.isConnected()) {
            let data = [this.state.activeXProportion, this.state.activeYProportion];
            socket.send(data);
        }
    }
    componentDidMount() {
        this.unsubscribe = this.props.authWrapper.onAuthStateChanged(this.handleAuthStateChange);
        this.interval = setInterval(() => {
            this.sendData();
        }, 1000 / 5);
    }

    componentWillUnmount() {
        if(this.unsubscribe != null){
            this.unsubscribe();
            this.unsubscribe = null;
        }
        if (this.interval != null) {
            clearInterval(this.interval);
            this.interval = null;
            console.log('Cleaned up interval');
        }
    }
    handleAuthStateChange(user) {
        if (user) {
            if (this.state.user == null || this.state.user.uid === user.uid) {
                // Re-login for the same user
                console.log('Signed in at actionBox uid: ' + user.uid);
                this.handleUserSignIn(user);
                user.getIdTokenResult(true)
                    .then((idTokenResult) => {
                        if (idTokenResult.claims.admin) {
                            this.setState({ isAdmin: true });
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                    });
                    this.setState({ user: user });
            }
            else {
                // Another account logged in
                console.log('Another account logged in.');
                socket.disconnect();
                this.setState({ user: null });
                this.props.history.push('/login');
            }
        } else {
            console.log('Signed out at actionBox');
            socket.disconnect();
            this.setState({ user: null });
            this.props.history.push('/login');
        }
    }


    handleUserSignIn(user) {
        user.getIdToken(/* forceRefresh */ false).then((token) => {
            socket.initialize(token, this.props.history);
            socket.addEventListener('disconnect', this.cleanUpInterval);
        });
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
            <>
                {
                    this.state.isAdmin ? <AdminView socket={socket} /> : <></>
                }
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
            </>
        )
    }
}

export default ActionBox;
