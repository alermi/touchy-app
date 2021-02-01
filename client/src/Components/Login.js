import React, { useContext } from "react";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { AuthContext } from "../Contexts/AuthContext";
import "./Login.css";
import logo2 from "../Resources/krea-logo-2.png";

const Login = (props) => {
  const { auth } = useContext(AuthContext);

  const uiConfig = {
    signInSuccessUrl: "/",
    callbacks: {
      signInSuccessWithAuthResult: function (authResult, redirectUrl) {
        // var user = authResult.user;
        // var credential = authResult.credential;
        // console.log('User ' + user + ' signed in successfully with credential: ' + credential);
        return false;
      },
      // signInFailure: function(error) {
      //     console.log('Failed to sign in.');
      //     //TODO: Handle the sign in failure
      // }
    },
    signInOptions: [
      auth.GoogleAuthProvider.PROVIDER_ID,
      auth.FacebookAuthProvider.PROVIDER_ID,
      {
        provider: auth.EmailAuthProvider.PROVIDER_ID,
        // Use email link authentication and do not require password.
        signInMethod: auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
        // Allow the user the ability to complete sign-in cross device, including
        // the mobile apps specified in the ActionCodeSettings object below.
        forceSameDevice: false,
        emailLinkSignIn: function () {
          console.log("email link sent");

          return {
            // Always true for email link sign-in.
            handleCodeInApp: true,
          };
        },
      },
    ],
  };
  return (
    <div className="Login">
      <a
        href="https://krea.today"
        style={{
          display: "flex",
          marginLeft: "35vw",
          marginRight: "35vw",
          marginTop: "auto",
          marginBottom: "auto",
        }}
      >
        <img src={logo2} alt="logo" className="Login-Logo" />
      </a>
      <p className="Login-Title"> AUDIENCE INTERACTION TOOL</p>
      <p>Sign in to continue:</p>
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth.getAuth()} />
    </div>
  );
};

export default Login;
