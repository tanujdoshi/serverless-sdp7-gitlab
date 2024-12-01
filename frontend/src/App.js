import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./Components/Home/Home";
import PubsubClientHome from "./Components/PubSub/pubsubClientHome";
import Login from "./Components/Authentication/Login/Login";
import JsonToCsvProcessor from "./Components/DataProcessing/JsonToCsvProcessor";
import TxtTransform from "./Components/DataProcessing/TxtTransform";
import WordCloud from "./Components/DataProcessing/WordCloud";
import SignUp from "./Components/Authentication/Register/Register";
import Confirmation from "./Components/Authentication/Register/Confirmation";
import Chat from "./Components/Chat/Chat";
import PubsubAgentHome from "./Components/PubSub/PubsubAgentHome";
import Navbar from "./Components/Navbar/Navbar";
import Feedback from "./Components/DataAnalysis/feedBack";
import { UserProvider } from "./Components/Context/UserContext";
import FeedbackTable from "./Components/DataAnalysis/feedbackTable";
import AdminPage from "./Components/DataAnalysis/admin";
import VirtualAssistant from "./Components/VirtualAssistant/Chat";

function App() {
  // const customerId = "testCustomerId";
  const agentId = "testAgentId";
  const isAgent = false;

  return (
    <UserProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />\
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/json-to-csv" element={<JsonToCsvProcessor />} />
          <Route path="/txt-transform" element={<TxtTransform />} />
          <Route path="/word-cloud" element={<WordCloud />} />
          <Route path="/virtual-assistant" element={<VirtualAssistant />} />
          <Route path="/" element={<Home />} />
          <Route path="/client" element={<PubsubClientHome />} />
          <Route path="/agent" element={<PubsubAgentHome />} />
          <Route path="/admin" element={<AdminPage />} />
          {/* <Route
            path="/"
            element={
              isAgent ? (
                <PubsubAgentHome agentId={agentId} />
              ) : (
                <PubsubClientHome customerId={customerId} />
              )
            }
          /> */}
          <Route
            path="/chat"
            element={
              <Chat />
            }
          />
          <Route
            path="/agent-home"
            element={<PubsubAgentHome agentId={agentId} />}
          />
          <Route 
            path="/feedbackform"
            element={<Feedback />}
          />   
          <Route path="/feedbacktable" element={<FeedbackTable />} /> 
          </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
