import React, { useContext } from "react";
import { Redirect, Route } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext";
import Banner from "../Components/Banner";

const AdminRoute = ({ component: Component, ...rest }) => {
  const { isAdmin } = useContext(AuthContext);
  return (
    <Route
      {...rest}
      render={(props) =>
        isAdmin ? (
          <>
            <Banner />
            <Component {...props} />
          </>
        ) : (
          <Redirect to="/" />
        )
      }
    />
  );
};
export default AdminRoute;
