import React, { createContext, Component } from 'react'
import authWrapper from '../Wrappers/AuthWrapper'
import { withRouter } from 'react-router'
export const AuthContext = createContext();

class AuthContextProvider extends Component {
    constructor() {
        super();
        this.authSubscribe = null;
        this.state = {
            currentUser: null,
            isAdmin: false,
            token: null
        }
    }

    componentDidMount() {
        const handleIdTokenChange = async (user) => {
            console.log('HandleIdTokenChange running');
            if (user) {
                let idTokenResult;
                try {
                    idTokenResult = await user.getIdTokenResult(false);
                }
                catch (err) {
                    console.log('ERROR: GetIdTokenResult failed at AuthContext. Error: ' + err.message);
                    return;
                }

                const previousUser = this.state.currentUser;
                const previousToken = this.state.token;
                if (previousUser == null || previousUser.uid === user.uid) {
                    // Re-login for the same user
                    if (previousUser != null) {
                        console.log('Same user signed in again');
                    }
                    else {
                        console.log('Signed in with uid: ' + user.uid);
                    }

                    if (previousToken !== idTokenResult.token) {
                        if (previousToken != null) {
                            console.log('AuthContext updating token');
                        }
                        else {
                            console.log('AuthContext setting token for the first time');
                        }
                    }
                    this.setState({
                        token: idTokenResult.token,
                        currentUser: user,
                        isAdmin: !!idTokenResult.claims.admin
                    });
                    this.props.history.push('/');
                }
                else {
                    // Another account logged in
                    console.log('Another account logged in on the same device.');
                    this.setState({
                        currentUser: null,
                        isAdmin: false,
                        token: null
                    });
                    this.props.history.push('/login');
                }
            }
            else {
                console.log('Signed out');
                this.setState({
                    currentUser: null,
                    isAdmin: false,
                    token: null
                });
                this.props.history.push('/login');
            }

        }
        this.authSubscribe = authWrapper.onIdTokenChanged(handleIdTokenChange);

    }

    componentWillUnmount() {
        this.authSubscribe();
        this.authSubscribe = null;
    }


    render() {
        const { children } = this.props;
        return (
            <AuthContext.Provider value={{
                currentUser: this.state.currentUser,
                isAdmin: this.state.isAdmin,
                auth: authWrapper,
                token: this.state.token
            }}>
                {children}
            </AuthContext.Provider>
        )
    }

}

export default withRouter(AuthContextProvider);