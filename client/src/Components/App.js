import React from "react";
import './App.css';
import { Switch, Route } from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import AdminView from './AdminView';
import { createBrowserHistory } from 'history';
import AuthContextProvider from '../Contexts/AuthContext';
import ProtectedRoute from '../Routes/ProtectedRoute';
import LoginRoute from '../Routes/LoginRoute';

import SocketContextProvider from '../Contexts/SocketContext'
const dotenv = require('dotenv');
dotenv.config();

const history = createBrowserHistory();
const App = () => {

  return (
    <div className="App" style={{ touchAction: 'none' }}>
      <AuthContextProvider history={history}>
        <SocketContextProvider>
          <Switch>
            <LoginRoute
              exact path='/login'
              component={Login}
            />
            <ProtectedRoute
              exact path='/'
              component={Home}
            />
            <Route
              exact path='/admin'
              component={AdminView}
            />
          </Switch>
        </SocketContextProvider>
      </AuthContextProvider>
    </div>
  )
}

export default App;
