import React, { useState, useContext, useEffect } from "react";
import { SocketContext } from "../Contexts/SocketContext";

const AdminView = (props) => {
  const { socket, connected } = useContext(SocketContext);
  const [artistEmail, setArtistEmail] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [showingAlert, setShowingAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    if (showingAlert) {
      return setTimeout(() => {
        setShowingAlert(false);
      }, 5000);
    }
  }, [showingAlert]);

  const handleArtistRequestSubmit = (event) => {
    socket.sendUpgradeRequest(artistEmail, "artist");
    event.preventDefault();
    setArtistEmail("");
  };

  const handleAdminRequestSubmit = (event) => {
    socket.sendUpgradeRequest(adminEmail, "admin");
    event.preventDefault();
    setAdminEmail("");
  };

  const handleUpgradeResponse = (data) => {
    console.log("AdminView: " + data);
    setAlertMessage(data);
    setShowingAlert(true);
  };

  useEffect(() => {
    if (connected) {
      socket.addEventListener("upgradeResponse", handleUpgradeResponse);
      return () => {
        socket.removeAllListenersOfEvent("upgradeResponse");
      };
    }
  }, [socket, connected]);

  const handleArtistEmailChange = (event) => {
    setArtistEmail(event.target.value);
  };

  const handleAdminEmailChange = (event) => {
    setAdminEmail(event.target.value);
  };
  return (
    <>
      <form onSubmit={handleArtistRequestSubmit}>
        <h4>Upgrade user to artist</h4>
        <label>
          Email:
          <input
            type="text"
            value={artistEmail}
            onChange={handleArtistEmailChange}
          />
        </label>
        <input type="submit" value="Submit" />
      </form>

      <form onSubmit={handleAdminRequestSubmit}>
        <h4>Upgrade user to ADMIN</h4>
        <label>
          Email:
          <input
            type="text"
            value={adminEmail}
            onChange={handleAdminEmailChange}
          />
        </label>
        <input type="submit" value="Submit" />
      </form>
      <div>{showingAlert ? <strong>{alertMessage}</strong> : <></>}</div>
    </>
  );
};

export default AdminView;
