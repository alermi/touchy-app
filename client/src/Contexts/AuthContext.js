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
            isAdmin: false
        }
    }

    componentDidMount() {
        const handleIdTokenChange = (user) => {
            console.log('HandleIdTokenChange ran');
            this.setState((prevState, props) => {
                const previousUser = prevState.currentUser;
                if (user) {
                    if (previousUser == null || previousUser.uid === user.uid) {
                        // Re-login for the same user
                        console.log('Signed in with uid: ' + user.uid);
                        if (previousUser != null) {
                            console.log('Same user signed in again');
                        }
                        // user.getIdToken(/* forceRefresh */ false).then((token) => {
                        //     socket.initialize(token, this.props.history);
                        // });
                        
                        user.getIdTokenResult(true)
                            .then((idTokenResult) => {
                                if (idTokenResult.claims.admin) {
                                    this.setState({ isAdmin: true })
                                }
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                        return { currentUser: user };
                    }
                    else {
                        // Another account logged in
                        console.log('Another account logged in.');
                        // socket.disconnect();
                        props.history.push('/login');
                        return { currentUser: null };
                    }
                } else {
                    console.log('Signed out');
                    // socket.disconnect();
                    props.history.push('/login');
                    return { currentUser: null };
                }
            })

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
                auth: authWrapper
            }}>
                {children}
            </AuthContext.Provider>
        )
    }

}

export default withRouter(AuthContextProvider);