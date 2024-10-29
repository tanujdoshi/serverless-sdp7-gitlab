import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Button } from "@mui/material";
import Home from "./Components/Home/Home";
import Login from "./Components/Authentication/Login/Login";
import SignUp from "./Components/Authentication/Register/Register";
import JsonToCsvProcessor from "./Components/DataProcessing/JsonToCsvProcessor";

function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/login">
            Login
          </Button>
          <Button color="inherit" component={Link} to="/signup">
            Sign Up
          </Button>

          <Button color="inherit" component={Link} to="/glue-process">
            Process File
          </Button>
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/glue-process" element={<JsonToCsvProcessor />} />
      </Routes>
    </Router>
  );
}

export default App;
