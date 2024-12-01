// Navbar.js
import React, { useContext } from "react";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
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
    <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box>
          <Button color="inherit" component={Link} to="/" sx={{ fontSize: 16 }}>
            Home
          </Button>
        </Box>
        <Box>
          {isLoggedIn ? (
            <>
              <Button color="inherit" component={Link} to="/feedbackform">
                DP Feedback Form
              </Button>
              <Button color="inherit" component={Link} to="/feedbacktable">
                DP Feedback Table
              </Button>
              <Button color="inherit" component={Link} to="/admin">
                Admin
              </Button>
              <Button color="inherit" component={Link} to="/virtual-assistant">
                Virtual Assistant
              </Button>
              <Button
                color="inherit"
                onClick={onLogout}
                sx={{
                  backgroundColor: "#e57373",
                  ":hover": { backgroundColor: "#ef5350" },
                }}
              >
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
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
