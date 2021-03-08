import React, { useContext, useState } from "react";
import { stack as Menu } from "react-burger-menu";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext";
import "./Burger.css";

const Burger = () => {
  const history = useHistory();
  const [isOpen, setIsOpen] = useState();
  const { auth, isAdmin, currentUser } = useContext(AuthContext);
  const isLoggedIn = currentUser ? true : false;

  const closeMenu = () => {
    setIsOpen(false);
  };
  const handleMenuStateChange = (state) => {
    setIsOpen(state.isOpen);
  };

  return (
    <div>
      <Menu
        disableAutoFocus
        isOpen={isOpen}
        onStateChange={(state) => handleMenuStateChange(state)}
      >
        <p
          className="menu-item"
          onClick={() => {
            history.push("/");
            closeMenu();
          }}
        >
          HOME
        </p>
        {isLoggedIn && (
          <p
            className="menu-item"
            onClick={() => {
              auth.signOut();
            }}
          >
            SIGN OUT
          </p>
        )}

        <p
          className="menu-item"
          onClick={() => {
            history.push("./privacyPolicy");
            closeMenu();
          }}
        >
          PRIVACY POLICY
        </p>
        {isLoggedIn && (
          <p
            className="menu-item"
            style={{
              marginTop: "auto",
              color: "gray",
            }}
            onClick={() => {
              if (isAdmin) {
                history.push("/admin");
                closeMenu();
              } else {
                history.push("./removeData");
                closeMenu();
              }
            }}
          >
            {isAdmin ? "Admin Panel" : "Delete Account"}
          </p>
        )}
      </Menu>
    </div>
  );
};

export default Burger;
