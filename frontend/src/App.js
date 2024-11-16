import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./Components/Home/Home";
import Login from "./Components/Authentication/Login/Login";
import JsonToCsvProcessor from "./Components/DataProcessing/JsonToCsvProcessor";
import TxtTransform from "./Components/DataProcessing/TxtTransform";
import WordCloud from "./Components/DataProcessing/WordCloud";
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
          <Route path="/json-to-csv" element={<JsonToCsvProcessor />} />
          <Route path="/txt-transform" element={<TxtTransform />} />
          <Route path="/word-cloud" element={<WordCloud />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
