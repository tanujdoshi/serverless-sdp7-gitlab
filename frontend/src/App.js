import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Button } from "@mui/material";
import Home from "./Components/Home/Home";
import Login from "./Components/Authentication/Login/Login";
import SignUp from "./Components/Authentication/Register/Register";
import Confirmation from "./Components/Authentication/Register/Confirmation";
import Chat from "./Components/Chat/Chat";
import AgentHome from "./Components/Home/AgentHome";

function App() {

  const customerId = "testCustomerId";
  const agentId = "testAgentId";
  const isAgent = false; 


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
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/" element={<Home customerId={customerId} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/" element={isAgent ? <AgentHome agentId={agentId} /> : <Home customerId={customerId} />} />
        <Route path="/chat" element={<Chat userId={isAgent ? agentId : customerId} isAgent={isAgent} />} />
        <Route path="/agent-home" element={<AgentHome agentId={agentId} />} />
      </Routes>
    </Router>
  );
}

export default App;
