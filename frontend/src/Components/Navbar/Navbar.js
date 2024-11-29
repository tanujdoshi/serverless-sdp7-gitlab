// Navbar.js
import React, { useContext } from "react";
import { AppBar, Toolbar, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../Context/UserContext";

function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, logoutUser } = useContext(UserContext);

  const onLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Button color="inherit" component={Link} to="/">
          Home
        </Button>
        {isLoggedIn ? (
          <>
            <Button color="inherit" component={Link} to="/txt-transform">
              txt-transform
            </Button>
            <Button color="inherit" component={Link} to="/json-to-csv">
              json-to-csv
            </Button>
            <Button color="inherit" component={Link} to="/word-cloud">
              Word cloud
            </Button>
            <Button color="inherit" component={Link} to="/virtual-assistant">
              Virtual Assistant
            </Button>
            <Button color="inherit" onClick={onLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/signup">
              Sign Up
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
