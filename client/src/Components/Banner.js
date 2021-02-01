import React, { useContext, useState } from "react";
import "./Banner.css";
import "./Burger.css";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext";
import logo from "../Resources/krea-logo.png";
import { stack as Menu } from "react-burger-menu";
const Banner = (props) => {
  const history = useHistory();
  const [isOpen, setIsOpen] = useState();
  const { auth, isAdmin } = useContext(AuthContext);

  const closeMenu = () => {
    setIsOpen(false);
  };
  const handleMenuStateChange = (state) => {
    setIsOpen(state.isOpen);
  };
  return (
    <div className="Banner">
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
          {" "}
          HOME{" "}
        </p>
        <p
          className="menu-item"
          onClick={() => {
            auth.signOut();
          }}
        >
          {" "}
          SIGN OUT{" "}
        </p>
        <p
          className="menu-item"
          style={{
            marginTop: "auto",
            marginBottom: "50px",
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
          {" "}
          {isAdmin ? "Admin Panel" : "Delete Account"}{" "}
        </p>
      </Menu>
      <a
        href="https://krea.today"
        style={{
          display: "flex",
          marginLeft: "auto",
        }}
      >
        <img src={logo} alt="logo" className="Logo" />
      </a>
    </div>
  );
};

export default Banner;
