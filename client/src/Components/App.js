import React, { useEffect } from "react";
import './App.css';
import { Switch, Route } from 'react-router-dom';
import Login from './Login';
import Home from './Home'
import AuthWrapper from '../Wrappers/authWrapper'

const dotenv = require('dotenv');
dotenv.config();

const authWrapper = new AuthWrapper();

const App = () => {
  return (
    <div className="App" style={{ touchAction: 'none' }}>
      <Switch>
        <Route
          exact path='/login'
          render={(props) => <Login {...props} authWrapper={authWrapper} />}
        />
        <Route
          exact path='/'
          render={(props) => <Home {...props} authWrapper={authWrapper} />}
        />
      </Switch>
    </div>
  )
}

export default App;
