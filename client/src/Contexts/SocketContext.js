import React, { createContext, useEffect, useContext, useState } from "react";
import { AuthContext } from "../Contexts/AuthContext";
import SocketWrapper from "../Wrappers/SocketWrapper";
const socketWrapper = new SocketWrapper();

export const SocketContext = createContext();

const SocketContextProvider = (props) => {
  const { token, stubbornRefresh, handleNewLogin } = useContext(AuthContext);
  const { children } = props;
  const [connected, setConnected] = useState(false);

  // Effect to initialize and disconnect socket based on current user.
  useEffect(() => {
    console.log("SocketContext effect that controls the socketWrapper called");
    if (token != null) {
      if (!!socketWrapper.getToken() && socketWrapper.getToken() !== token) {
        console.log("SocketContext updating socketWrapper token");
        socketWrapper.setToken(token);
      }
      if (!connected) {
        console.log(
          "SocketContext calling initialize on socket (after a cleanup)"
        );
        socketWrapper.initialize(
          token,
          handleNewLogin,
          stubbornRefresh,
          setConnected
        );
      }
    } else {
      if (!!socketWrapper) {
        console.log("SocketContext cleaning up socket");
        socketWrapper.cleanUp();
      }
    }
  }, [handleNewLogin, token, stubbornRefresh, connected]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketWrapper,
        connected: connected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContextProvider;
