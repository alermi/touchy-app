import React, { createContext, useEffect, useContext } from 'react'
import { AuthContext } from '../Contexts/AuthContext'
import SocketWrapper from '../Wrappers/SocketWrapper'

export const SocketContext = createContext();
const socket = new SocketWrapper();

const SocketContextProvider = (props) => {
    const { token, forceRefreshToken, handleNewLogin } = useContext(AuthContext);
    const { children } = props;

    // Effect to initialize and disconnect socket based on current user.
    useEffect(() => {
        console.log('SocketContext: Effect responsible of initializing socket called');
        if (token != null) {
            if (socket.isConnected()) {
                console.log('Socket was already connected. Updating token');
                socket.setToken(token);
            }
            else {
                console.log('SocketContext calling initialize on socket');
                socket.initialize(token, handleNewLogin, forceRefreshToken);
            }
        }
        else {
            if (!!socket && socket.isConnected()) {
                console.log('Disconnecting socket');
                socket.disconnect();
            }
        }
    }, [handleNewLogin, token, forceRefreshToken])

    return (
        <SocketContext.Provider value={{
            socket: socket
        }}>
            {children}
        </SocketContext.Provider>
    )

}

export default SocketContextProvider;