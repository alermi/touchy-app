import React, { useContext } from 'react'
import ActionBox from './ActionBox'
import { AuthContext } from '../Contexts/AuthContext'
import { useHistory } from 'react-router-dom';

const Home = (props) => {
    const { auth, isAdmin } = useContext(AuthContext)
    const history = useHistory();

    return (
        <div>
            <header className="App-header">
                <p>Touch the box to interact</p>
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