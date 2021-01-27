import React, { useState, useEffect, useContext, useRef } from "react";
import { withRouter } from 'react-router';
import './ActionBox.css'
import ReactCursorPosition from 'react-cursor-position';
import Cursor from './Cursor';
import AdminView from './AdminView';
import SocketWrapper from '../Wrappers/SocketWrapper'
import { AuthContext } from '../Contexts/AuthContext'

const socket = new SocketWrapper();

const ActionBox = (props) => {
    const { isAdmin, token } = useContext(AuthContext);

    const [isActive, setIsActive] = useState(false);
    const [isPositionOutside, setIsPositionOutside] = useState(true);
    const [elementDimensions, setElementDimensions] = useState({
        width: -1,
        height: -1
    });
    const [activeProportions, setActiveProportions] = useState({
        x: 0,
        y: 0
    });

    // Effect to initialize and disconnect socket based on current user.
    useEffect(() => {
        console.log('ActionBox: Effect responsible of initializing socket called');
        if (token != null) {
            if (socket.isConnected()) {
                console.log('Socket was already connected. Updating token');
                socket.updateToken(token);
            }
            else {
                socket.initialize(token, props.history);
            }
        }
        else {
            if (!!socket && socket.isConnected()) {
                console.log('Disconnecting socket');
                socket.disconnect();
            }
        }
    }, [props.history, token])

    const sendData = () => {
        if (!isPositionOutside && isActive && socket && socket.isConnected()) {
            let data = [activeProportions.x, activeProportions.y];
            socket.send(data);
        }
    }
    // useEffect that sets up an interval that uses send data reference 
    // so that it has the updated coordinates and flags for future calls.
    const sendDataRef = useRef();
    useEffect(() => {
        sendDataRef.current = sendData;
    })

    useEffect(() => {
        const interval = setInterval(() => {
            sendDataRef.current();
        }, 1000 / 5);
        return () => clearInterval(interval);
    }, [])

    const onPositionChanged = (e) => {
        if (e.elementDimensions != null) {
            setElementDimensions({
                width: e.elementDimensions.width,
                height: e.elementDimensions.height
            });
        }

        setIsPositionOutside(e.isPositionOutside);
        if (!e.isPositionOutside) {
            let x = e.position.x;
            let y = e.position.y;
            // Set if the elementDimensions have been set previously.
            if (elementDimensions.width !== -1 && elementDimensions.height !== -1) {
                setActiveProportions({
                    x: (x / elementDimensions.width),
                    y: (y / elementDimensions.height)
                })
            }
        }
    }

    const onActivationChanged = (e) => {
        setIsActive(e.isActive);
        sendDataRef.current();
    }

    return (
        <>
            {
                isAdmin ? <AdminView socket={socket} /> : <></>
            }
            <div className="Action-box">
                <ReactCursorPosition
                    style={{ width: '100%' }}
                    activationInteractionTouch='touch'
                    onPositionChanged={onPositionChanged}
                    onActivationChanged={onActivationChanged}
                >

                    <Cursor className="cursor" />
                        isActive: {isActive ? 'true ' : 'false '}  <br />
                        isPositionOutside: {isPositionOutside ? 'true' : 'false'} <br />
                        x: {activeProportions.x}  <br />
                        y: {activeProportions.y} <br />
                </ReactCursorPosition>
            </div>
        </>
    )
}

export default withRouter(ActionBox);
