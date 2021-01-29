import React, { useContext } from 'react'
import { Redirect, Route } from 'react-router-dom'
import { AuthContext } from '../Contexts/AuthContext'

const LoginRoute = ({ component: Component, ...rest }) => {
    const { currentUser } = useContext(AuthContext);
    return (
        <Route {...rest} render={props => (
            currentUser == null ?
                <Component {...props} />
                :
                <Redirect to="/" />

        )} />
    )
}
export default LoginRoute;