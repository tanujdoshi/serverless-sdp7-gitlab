import React, { useState, useEffect, createContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Button } from "@mui/material";
import Home from "./Components/Home/Home";
import Login from "./Components/Authentication/Login/Login";
import SignUp from "./Components/Authentication/Register/Register";
import Confirmation from "./Components/Authentication/Register/Confirmation";
import Navbar from "./Components/Navbar/Navbar";
import { UserProvider } from "./Components/Context/UserContext";
function App() {
  return (
    <UserProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />\
          <Route path="/confirmation" element={<Confirmation />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
