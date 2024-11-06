import React, { useContext } from "react";
import { UserContext } from "../Context/UserContext";

function Home() {
  const { userData } = useContext(UserContext);

  return (
    <div>
      <h1>Welcome to SDP-Group #7</h1>
      <h2>
        {userData ? <p>Welcome, {userData.name}</p> : <p>Please log in.</p>}
      </h2>
    </div>
  );
}

export default Home;
