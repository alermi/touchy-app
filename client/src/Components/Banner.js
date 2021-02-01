import React from "react";
import logo from "../Resources/krea-logo.png";
import Burger from "./Burger";
import "./Banner.css";
// import { stack as Menu } from "react-burger-menu";
const Banner = (props) => {
  return (
    <div className="Banner">
      <Burger />
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
