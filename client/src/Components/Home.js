import React, { useContext } from "react";
import ActionBox from "./ActionBox";
import { AuthContext } from "../Contexts/AuthContext";

const Home = (props) => {
  const { auth } = useContext(AuthContext);

  return <ActionBox authWrapper={auth} />;
};

export default Home;
