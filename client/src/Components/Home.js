import React, { useContext } from 'react'
import ActionBox from './ActionBox'
import { AuthContext } from '../Contexts/AuthContext'
import { SocketContext } from '../Contexts/SocketContext'

import { useHistory } from 'react-router-dom';

const Home = (props) => {
    const { auth, isAdmin } = useContext(AuthContext)
    const { connected } = useContext(SocketContext)
    const history = useHistory();

    return (
        <div>
            <header className="App-header">
                <p>Touch the box to interact</p>
                <b>Connection Status: {connected ? 'Connected' : 'Disconnected'}</b>
            </header>
            <div style={{ marginLeft: '10%', marginRight: '10%' }}>
                <ActionBox authWrapper={auth} />
            </div>
            <button onClick={() => { auth.signOut() }}>Sign out</button>
            {isAdmin ?
                <button onClick={() => { history.push('/admin') }}>Admin Panel</button>
                :
                <></>
            }
        </div>
    )
}

export default Home;