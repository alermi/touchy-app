import React, { Component } from "react";
import './App.css';

import { io } from "socket.io-client";

const dotenv = require('dotenv');
dotenv.config();

const socket = io(process.env.REACT_APP_API_URL);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      apiResponse: ""
    };
  }
  
  callAPI() {
    fetch( process.env.REACT_APP_API_URL + '/testAPI' )
        .then(res => res.text())
        .then(res => this.setState({ apiResponse: res }));
  }

  componentDidMount() {
      this.callAPI();

      socket.on('connect', () => {
        console.log("Connected to server socket.io");
      });
  }

  handleMouseMove(e){
    console.log('x: ' + e.clientX + ' y: ' + e.clientY);
    socket.send('x: ' + e.clientX + ' y: ' + e.clientY);
  }

  render(){
    return (
      <div className="App" style={{ touchAction: 'none' }}>
        <div onMouseMove={this.handleMouseMove} >
          <header className="App-header">
            <p>{this.state.apiResponse}</p>
          </header>
        </div>

      </div>
    )
  }
}

export default App;
