import React, { createContext, useEffect, useContext, useState } from 'react'
import { AuthContext } from '../Contexts/AuthContext'
import socketWrapper from '../Wrappers/SocketWrapper'

export const SocketContext = createContext();

const SocketContextProvider = (props) => {
    const { token, forceRefreshToken, handleNewLogin } = useContext(AuthContext);
    const { children } = props;
    const [connected, setConnected] = useState(false);

    // Effect to initialize and disconnect socket based on current user.
    useEffect(() => {
        console.log('SocketContext: Effect responsible of initializing socket called');
        if (token != null) {
            if (connected) {
                console.log('Socket was already connected. Updating token');
                socketWrapper.setToken(token);
            }
            else {
                console.log('SocketContext calling initialize on socket (after a cleanup)');
                socketWrapper.cleanUp();
                socketWrapper.initialize(token, handleNewLogin, forceRefreshToken, setConnected);
            }
        }
        else {
            if (!!socketWrapper && connected) {
                console.log('Disconnecting socket');
                socketWrapper.cleanUp();
            }
        }
    }, [handleNewLogin, token, forceRefreshToken, connected])

    return (
        <SocketContext.Provider value={{
            socket: socketWrapper,
            connected: connected
        }}>
            {children}
        </SocketContext.Provider>
    )

}

export default SocketContextProvider;