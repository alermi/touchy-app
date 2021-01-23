import React from 'react'
import ActionBox from './ActionBox'

const Home = (props) => {
    return (
        <div>
            <header className="App-header">
                <p>Touch the box to interact</p>
            </header>
            <div style={{ marginLeft: '10%', marginRight: '10%' }}>
                <ActionBox history={props.history} authWrapper={props.authWrapper} />
            </div>
            <button onClick={() => { props.authWrapper.signOut() }}>Sign out</button>
        </div>
    )
}

export default Home;