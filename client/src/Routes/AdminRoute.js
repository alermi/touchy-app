import React, { useContext } from 'react'
import { Redirect, Route } from 'react-router-dom'
import { AuthContext } from '../Contexts/AuthContext'

const AdminRoute = ({ component: Component, ...rest }) => {
    const { isAdmin } = useContext(AuthContext);
    return (
        <Route {...rest} render={props => (
            isAdmin ?
                <Component {...props} />
                :
                <Redirect to="/" />
        )} />
    )
}
export default AdminRoute;