import React, { createContext, Component } from "react";
import authWrapper from "../Wrappers/AuthWrapper";
export const AuthContext = createContext();

class AuthContextProvider extends Component {
  constructor() {
    super();
    this.authSubscribe = null;
    this.state = {
      currentUser: null,
      isAdmin: false,
      token: null,
    };

    this.handleIdTokenChange = this.handleIdTokenChange.bind(this);
    this.forceRefreshToken = this.forceRefreshToken.bind(this);
    this.stubbornRefresh = this.stubbornRefresh.bind(this);
    this.handleNewLogin = this.handleNewLogin.bind(this);
  }
  handleIdTokenChange = async (user) => {
    if (user) {
      let idTokenResult;
      try {
        idTokenResult = await user.getIdTokenResult(false);
      } catch (err) {
        console.log(
          "ERROR: GetIdTokenResult failed at AuthContext. Error: " + err.message
        );
        return;
      }

      const previousUser = this.state.currentUser;
      const previousToken = this.state.token;
      if (previousUser == null || previousUser.uid === user.uid) {
        // Re-login for the same user
        if (previousUser != null) {
          console.log("Same user signed in again");
        } else {
          console.log("Signed in with uid: " + user.uid);
        }

        if (previousToken !== idTokenResult.token) {
          if (previousToken != null) {
            console.log("AuthContext updating token");
          } else {
            console.log("AuthContext setting token for the first time");
          }
        }
        this.setState({
          token: idTokenResult.token,
          currentUser: user,
          isAdmin: !!idTokenResult.claims.admin,
        });
      } else {
        // Another account logged in
        console.log("Another account logged in on the same device.");
        this.setState({
          currentUser: null,
          isAdmin: false,
          token: null,
        });
      }
    } else {
      console.log("Signed out");
      this.setState({
        currentUser: null,
        isAdmin: false,
        token: null,
      });
    }
  };
  componentDidMount() {
    console.log("AuthContext component mounted");
    if (this.authSubscribe === null) {
      console.log("AuthContext subscribing to onIdTokenChanged");
      this.authSubscribe = authWrapper.onIdTokenChanged(
        this.handleIdTokenChange
      );
    }
  }

  componentWillUnmount() {
    console.log("AuthContext unmounted");
    this.authSubscribe();
    this.authSubscribe = null;
  }

  forceRefreshToken() {
    console.log("ForceRefreshToken called");
    if (this.state.currentUser == null) {
      console.log("CurrentUser was null at forceRefreshToken. Ignored call");
      return Promise.resolve(null);
    }
    return this.state.currentUser
      .getIdToken(/* forceRefresh */ true)
      .then((token) => {
        if (this.state.token !== token) {
          console.log("Token changed in forceRefreshToken");
          this.setState({
            token: token,
          });
        } else {
          console.log("Token did not change in forceRefreshToken");
        }
        return Promise.resolve(token);
      });
  }

  stubbornRefresh() {
    console.log("StubbornRefresh called");
    this.forceRefreshToken().catch((err) => {
      setTimeout(() => {
        console.log(
          "Error in forcerefresh in stubbornRefresh. Trying again in 5 seconds."
        );
        this.stubbornRefresh();
      }, 5000);
    });
  }

  handleNewLogin() {
    console.log("AuthContext handling new login");
    this.setState({
      currentUser: null,
      isAdmin: false,
      token: null,
    });
  }
  render() {
    const { children } = this.props;
    return (
      <AuthContext.Provider
        value={{
          currentUser: this.state.currentUser,
          isAdmin: this.state.isAdmin,
          auth: authWrapper,
          token: this.state.token,
          stubbornRefresh: this.stubbornRefresh,
          handleNewLogin: this.handleNewLogin,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }
}

export default AuthContextProvider;
