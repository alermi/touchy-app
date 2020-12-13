import React, { Component } from "react";
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      apiResponse: ""
    };
  }
  
  callAPI() {
    fetch("http://192.168.86.191:9000/testAPI")
        .then(res => res.text())
        .then(res => this.setState({ apiResponse: res }));
  }

  componentDidMount() {
      this.callAPI();
  }

  handleMouseMove(e){
    console.log('x: ' + e.clientX + ' y: ' + e.clientY);
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
