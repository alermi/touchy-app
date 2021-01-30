import React, { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../Contexts/AuthContext'
import { useHistory } from 'react-router-dom';

const RemoveDataView = () => {

    const { currentUser } = useContext(AuthContext)
    const history = useHistory();
    const [showingAlert, setShowingAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        if (showingAlert) {
            return setTimeout(() => {
                setShowingAlert(false);
            }, 5000)
        }
    }, [showingAlert])

    const onClick = () => {
        currentUser.delete().then(function () {
            console.log('User Deleted!');
        }).catch(function (error) {
            setAlertMessage(error.message);
            setShowingAlert(true);
        });
    }

    return (
        <div>
            <p>Press the 'Delete Data' button in order to delete your user data.
            You must have signed in recently in order for this to work.
            </p>
            <div>
                <button onClick={onClick}>Delete Data</button>
            </div>
            <div>
                <button onClick={() => { history.push('/') }}>Go Back</button>
            </div>
            {showingAlert ?
                <strong>{alertMessage}</strong>
                :
                <></>
            }
        </div>

    )
}

export default RemoveDataView;