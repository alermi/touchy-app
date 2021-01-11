import React, { Component } from "react";
import './App.css';
import firebase from 'firebase'
import { Switch, Route } from 'react-router-dom';
import Login from './Login';
import Home from './Home'
const dotenv = require('dotenv');
dotenv.config();

firebase.initializeApp({
  apiKey: 'AIzaSyCz0liPBXblxmbPOLU3hVH-6-nIs4Kr7QU',
  authDomain: 'ait-krea.firebaseapp.com'
})

class App extends Component {

  render(){
    return (
        <div className="App" style={{ touchAction: 'none' }}>
          <Switch>
              <Route 
                exact path='/login' 
                render={(props) => <Login {...props} firebase={firebase} />}
              />
              <Route 
                exact path='/' 
                render={(props) => <Home {...props} firebase={firebase} />}
              />
          </Switch>
        </div>
    )
  }
}

export default App;
