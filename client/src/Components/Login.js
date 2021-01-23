import React, { Component } from 'react'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'

class Login extends Component {
    constructor(props) {
        super(props);
        this.uiConfig = {
            signInSuccessUrl: '/',
            callbacks: {
                signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                    // var user = authResult.user;
                    // var credential = authResult.credential;
                    // console.log('User ' + user + ' signed in successfully with credential: ' + credential);
                    return true;
                },
                // signInFailure: function(error) {
                //     console.log('Failed to sign in.');
                //     //TODO: Handle the sign in failure
                // }
            },
            signInOptions: [
                this.props.authWrapper.GoogleAuthProvider.PROVIDER_ID,
                this.props.authWrapper.FacebookAuthProvider.PROVIDER_ID,
                {
                    provider: this.props.authWrapper.EmailAuthProvider.PROVIDER_ID,
                    // Use email link authentication and do not require password.
                    signInMethod: this.props.authWrapper.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
                    // Allow the user the ability to complete sign-in cross device, including
                    // the mobile apps specified in the ActionCodeSettings object below.
                    forceSameDevice: false,
                    emailLinkSignIn: function () {
                        console.log('email link sent');

                        return {
                            // Always true for email link sign-in.
                            handleCodeInApp: true
                        };
                    }
                }
            ]
        }
    }

    render() {
        return (
            <StyledFirebaseAuth uiConfig={this.uiConfig} firebaseAuth={this.props.authWrapper.getAuth()} />
        )
    }
}


export default Login;