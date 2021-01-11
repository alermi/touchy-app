import React, { Component } from 'react'
import ActionBox from './ActionBox'

class Home extends Component {
    constructor(props){
        super(props);
        this.handleSignOutButtonClick = this.handleSignOutButtonClick.bind(this);
    }

    handleSignOutButtonClick(){
        this.props.firebase.auth().signOut();
        this.props.history.push('/login')
    }
    render() {
        return (
            <div>            
                <header className="App-header">
                    <p>Touch the box to interact</p>
                </header>
                <div style={{marginLeft: '10%', marginRight: '10%'}}>
                    <ActionBox history={this.props.history} firebase={this.props.firebase}/>
                </div>
                <button onClick={this.handleSignOutButtonClick}>Sign out</button>
            </div>
        )
    }
}

export default  Home;