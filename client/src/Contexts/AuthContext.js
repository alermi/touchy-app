import React, { createContext, useState, useEffect } from 'react'
import authWrapper from '../Wrappers/AuthWrapper'
import { withRouter } from 'react-router'
export const AuthContext = createContext();

export const AuthContextProvider = withRouter((props) => {
    const [currentUser, setCurrentUser] = useState(null);
    
    const [isAdmin, setIsAdmin] = useState(false);

    const { children } = props;
    useEffect(() => {
        console.log('AuthContext useEffect ran');
        const handleAuthStateChange = (user) => {
            console.log('HandleAuthStateChange ran');
            setCurrentUser((previousUser) => {
                if (user) {
                    if (previousUser == null || previousUser.uid === user.uid) {
                        // Re-login for the same user
                        console.log('Signed in with uid: ' + user.uid);
                        if (previousUser != null) {
                            console.log('Current user.uid: ' + previousUser.uid);
                        }
                        // user.getIdToken(/* forceRefresh */ false).then((token) => {
                        //     socket.initialize(token, this.props.history);
                        // });
                        user.getIdTokenResult(true)
                            .then((idTokenResult) => {
                                if (idTokenResult.claims.admin) {
                                    setIsAdmin(true);
                                }
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                        return (user);
                    }
                    else {
                        // Another account logged in
                        console.log('Another account logged in.');
                        // socket.disconnect();
                        props.history.push('/login');
                        return (null)
                    }
                } else {
                    console.log('Signed out');
                    // socket.disconnect();
                    if(previousUser != null){
                        props.history.push('/login');
                        return(null)
                    }
                }
                return previousUser;
            })

        }
        return authWrapper.onAuthStateChanged(handleAuthStateChange);
    }, [])

    return (
        <AuthContext.Provider value={{
            currentUser: currentUser,
            isAdmin: isAdmin,
            auth: authWrapper
        }}>
            {children}
        </AuthContext.Provider>
    )

})

// export default withRouter(AuthContextProvider);