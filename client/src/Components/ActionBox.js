import React, { useState, useEffect, useContext } from "react";
import { withRouter } from 'react-router';
import './ActionBox.css'
import ReactCursorPosition from 'react-cursor-position';
import Cursor from './Cursor';
import AdminView from './AdminView';
import SocketWrapper from '../Wrappers/SocketWrapper'
import { AuthContext } from '../Contexts/AuthContext'
const socket = new SocketWrapper();

const ActionBox = (props) => {
    const { currentUser } = useContext(AuthContext);

    const [state, setState] = useState({
        user: null,
        isAdmin: false,
        activeXProportion: 0,
        activeYProportion: 0,
        isActive: false,
        isPositionOutside: true,
    });
    const [elementDimensions, setElementDimensions] = useState({
        width: -1,
        height: -1
    });

    const sendData = () => {
        if (!state.isPositionOutside && state.isActive && socket && socket.isConnected()) {
            let data = [state.activeXProportion, state.activeYProportion];
            socket.send(data);
        }
    }

    useEffect(() => {
        console.log(currentUser);
        if (!!currentUser) {
            console.log('Initializing socket');
            currentUser.getIdToken(/* forceRefresh */ false).then((token) => {
                socket.initialize(token, props.history);
            });
        }
        else {
            if (!!socket) {
                console.log('Disconnecting socket');
                socket.disconnect();
            }
        }

        return setInterval(() => {
            sendData();
        }, 1000 / 5);
    }, [currentUser])


    const onPositionChanged = (e) => {
        if (e.elementDimensions != null) {
            setElementDimensions(e.elementDimensions);
        }

        setState({ isPositionOutside: e.isPositionOutside });
        if (!e.isPositionOutside) {
            let x = e.position.x;
            let y = e.position.y;
            // Set if the elementDimensions have been set previously.
            if (elementDimensions.width !== -1) {
                setState({ activeXProportion: (x / elementDimensions.width) });
            }
            if (elementDimensions.height !== -1) {
                setState({ activeYProportion: (y / elementDimensions.height) });
            }
        }
    }

    const onActivationChanged = (e) => {
        setState({ isActive: e.isActive });
        if (e.isActive) {
            sendData();
        }
    }

    return (
        <>
            {
                state.isAdmin ? <AdminView socket={socket} /> : <></>
            }
            <div className="Action-box">
                <ReactCursorPosition
                    style={{ width: '100%' }}
                    activationInteractionTouch='touch'
                    onPositionChanged={onPositionChanged}
                    onActivationChanged={onActivationChanged}>

                    <Cursor className="cursor" />
                        isActive: {state.isActive ? 'true ' : 'false '}  <br />
                        isPositionOutside: {state.isPositionOutside ? 'true' : 'false'} <br />
                        x: {state.activeXProportion}  <br />
                        y: {state.activeYProportion} <br />
                </ReactCursorPosition>
            </div>
        </>
    )
}

export default withRouter(ActionBox);
