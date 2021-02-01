import React from "react";
import "./App.css";
import { Switch } from "react-router-dom";
import Login from "./Login";
import Home from "./Home";
import RemoveDataView from "./RemoveDataView";
import AdminView from "./AdminView";
import AuthContextProvider from "../Contexts/AuthContext";
import ProtectedRoute from "../Routes/ProtectedRoute";
import LoginRoute from "../Routes/LoginRoute";
import AdminRoute from "../Routes/AdminRoute";

import SocketContextProvider from "../Contexts/SocketContext";
const dotenv = require("dotenv");
dotenv.config();

const App = () => {
  return (
    <div className="App">
      <AuthContextProvider>
        <SocketContextProvider>
          <Switch>
            <LoginRoute exact path="/login" component={Login} />
            <ProtectedRoute exact path="/" component={Home} />
            <AdminRoute exact path="/admin" component={AdminView} />
            <ProtectedRoute
              exact
              path="/removeData"
              component={RemoveDataView}
            />
          </Switch>
        </SocketContextProvider>
      </AuthContextProvider>
    </div>
  );
};

export default App;
