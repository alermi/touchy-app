import React, { useContext } from 'react'
import ActionBox from './ActionBox'
import { AuthContext } from '../Contexts/AuthContext'

const Home = (props) => {
    const { auth } = useContext(AuthContext)
    return (
        <div>
            <header className="App-header">
                <p>Touch the box to interact</p>
            </header>
            <div style={{ marginLeft: '10%', marginRight: '10%' }}>
                <ActionBox authWrapper={auth} />
            </div>
            <button onClick={() => { auth.signOut() }}>Sign out</button>
        </div>
    )
}

export default Home;