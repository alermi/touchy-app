import React, { Component } from "react";
import './App.css';
import { io } from "socket.io-client";

const dotenv = require('dotenv');
dotenv.config();

const socket = io(process.env.REACT_APP_SERVER_URL);
class App extends Component {
  constructor(props) {
    super(props);
  }
  
  // callAPI() {
    // fetch( process.env.REACT_APP_SERVER_URL + '/testAPI' )
        // .then(res => res.text())
        // .then(res => this.setState({ apiResponse: res }));
  // }

  componentDidMount() {
      socket.on('connect', () => {
        console.log("Connected to server socket.io");
      });
      
      this.interval = setInterval(() => {
        if(this.props.isActive){
          let x = this.props.position.x;
          let y = this.props.position.y;
          let xProportion = (x/this.props.elementDimensions.width);
          let yProportion = (y/this.props.elementDimensions.height);
          console.log([xProportion, yProportion]);
          socket.send([xProportion, yProportion]);
        }
      }, 1000/5);
  }

  componentWillUnmount(){
    clearInterval(this.interval);
  }
  // handleMouseMove(e){
  //   socket.send('x: ' + e.clientX + ' y: ' + e.clientY);
  // }

  render(){
    return (
        <div className="App" style={{ touchAction: 'none' }}>
          <div>
            <header className="App-header">
              <p>Press and move!</p>
            </header>
          </div>
        </div>

    )
  }
}

export default App;
