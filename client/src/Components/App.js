import React from "react";
import './App.css';
import { Switch, Route } from 'react-router-dom';
import Login from './Login';
import Home from './Home'
import { createBrowserHistory } from 'history'
// import authWrapper from '../Wrappers/AuthWrapper'
import { AuthContextProvider } from '../Contexts/AuthContext'
const dotenv = require('dotenv');
dotenv.config();

const history = createBrowserHistory();
const App = () => {

  return (
    <div className="App" style={{ touchAction: 'none' }}>
        <AuthContextProvider history={history}>
          <Switch>
            <Route
              exact path='/login'
              component={Login}
            />
            <Route
              exact path='/'
              component={Home}
            />
            
          </Switch>
        </AuthContextProvider>
    </div>
  )
}

export default App;
