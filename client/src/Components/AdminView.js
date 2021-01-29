import React, { useState, useContext, useEffect } from 'react'
import { SocketContext } from '../Contexts/SocketContext'

const AdminView = (props) => {
    const { socket, connected } = useContext(SocketContext)
    const [email, setEmail] = useState('');
    const [showingAlert, setShowingAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        if (showingAlert) {
            return setTimeout(() => {
                setShowingAlert(false);
            }, 5000)
        }
    }, [showingAlert])

    const handleSubmit = (event) => {
        socket.sendUpgradeToArtistRequest(email);
        event.preventDefault();
        setEmail('');
    }

    const handleUpgradeResponse = (data) => {
        console.log('AdminView: ' + data);
        setAlertMessage(data);
        setShowingAlert(true);
    }

    useEffect(() => {
        if (connected) {
            socket.addEventListener('upgradeResponse', handleUpgradeResponse);
            return (() => {
                socket.removeAllListenersOfEvent('upgradeResponse');
            });
        }
    }, [socket, connected])

    const handleChange = (event) => {
        setEmail(event.target.value);
    }
    return (
        <>
            <header className="App-header">
                <b>Socket Status: {connected ? 'Active' : 'Not Active'}</b>
            </header>
            <form onSubmit={handleSubmit}>
                <h4>Upgrade user to artist</h4>
                <label>
                    Email:
                <input type='text' value={email} onChange={handleChange} />
                </label>
                <input type='submit' value='Submit' />
            </form>
            {/* <div className='alert alert-success alert-shown'> */}
            {showingAlert ?
                <strong>{alertMessage}</strong>
                :
                <></>
            }
            {/* </div> */}
        </>
    )
}

export default AdminView;