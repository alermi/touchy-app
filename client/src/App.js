import React, { Component } from "react";
import './App.css';
import ActionBox from './ActionBox'


const dotenv = require('dotenv');
dotenv.config();
class App extends Component {

  render(){
    return (
        <div className="App" style={{ touchAction: 'none' }}>
          <div>
            <header className="App-header">
              <p>Touch the box to interact</p>
            </header>
            <div style={{marginLeft: '10%', marginRight: '10%'}}>
               <ActionBox/>
            </div>
          </div>
        </div>
    )
  }
}

export default App;
