import React, { Component } from "react";
import './App.css';

import { io } from "socket.io-client";
const socket = io('http://8b3ff6ac5254.ngrok.io');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      apiResponse: ""
    };
  }
  
  callAPI() {
    fetch("https://8b3ff6ac5254.ngrok.io/testAPI")
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
