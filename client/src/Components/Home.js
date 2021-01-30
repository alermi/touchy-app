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
                <b>Socket Status: {connected ? 'Active' : 'Not Active'}</b>
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
            <div>
                <button onClick={() => { history.push('/removeData') }}>Delete User Data</button>
            </div>
        </div>
    )
}

export default Home;