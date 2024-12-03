import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Tooltip, IconButton, Paper } from "@mui/material";
import { getAllDataProcess } from "../../api/apiService";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

import axios from "axios";
import {
  db,
  collection,
  addDoc,
  getDocs,
  doc,
  query,
  where,
  getDoc,
  updateDoc,
  orderBy,
} from "../Chat/firebase";
import { UserContext } from "../Context/UserContext";
import ChatDrawer from "../Chat/ChatDrawer";
import ConcernsTab from "./Agenttabs/ConcernsTab";
import RaiseConcernCard from "./Agenttabs/RaiseConcernCard";

const PubsubAgentHome = () => {
  const { userData } = useContext(UserContext);
  const agentId = localStorage.getItem("userEmail");
  const [concernText, setConcernText] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [assignedConcerns, setAssignedConcerns] = useState([]);
  const [raisedConcerns, setRaisedConcerns] = useState([]);
  const [dataProcess, setDataProcess] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConcern, setSelectedConcern] = useState(null); // Track selected concern
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [messages, setMessages] = useState([]); // Messages for the selected concern
  const navigate = useNavigate();

  // Fetch assigned and raised concerns
  useEffect(() => {
    const fetchConcerns = async () => {
      setLoading(true);
      try {
        const qAssigned = query(
          collection(db, "Concerns"),
          where("agentEmail", "==", agentId) // Concerns assigned to the agent
        );
        const qRaised = query(
          collection(db, "Concerns"),
          where("customerEmail", "==", agentId) // Concerns raised by the agent
        );

        const [assignedSnapshot, raisedSnapshot] = await Promise.all([
          getDocs(qAssigned),
          getDocs(qRaised),
        ]);

        const assigned = assignedSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const raised = raisedSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAssignedConcerns(assigned);
        setRaisedConcerns(raised);
      } catch (error) {
        console.error("Error fetching concerns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConcerns();
  }, [agentId]);

  useEffect(() => {
    const fetchDataProcess = async () => {
      try {
        const res = await getAllDataProcess(agentId);
        setDataProcess(res.data);
      } catch (error) {
        console.error("Error fetching concerns:", error);
      }
    };
    fetchDataProcess();
  }, [agentId]);

  const waitForFirestoreDocument = async (referenceId) => {
    const maxRetries = 10;
    const delay = 1000;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const q = query(
          collection(db, "Concerns"),
          where("referenceId", "==", referenceId) // Match the referenceId
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0]; // Get the first matching document
          return doc.id; // Return the Firestore document ID
        }
      } catch (error) {
        console.error("Error fetching Firestore document:", error);
      }

      await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before retrying
      retries++;
    }

    throw new Error("Timeout waiting for Firestore document creation.");
  };

  const createConcern = async () => {
    if (!concernText || !referenceId) return;

    try {
      const payload = {
        name: userData.name,
        email: agentId,
        referenceId: referenceId,
        concernText: concernText,
      };

      const response = await axios.post(
        "https://us-central1-serverless-project-439901.cloudfunctions.net/publishConcern",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`Concern published successfully: ${response.data}`);
      setConcernText("");

      const concernId = await waitForFirestoreDocument(referenceId);

      console.log("Concern ID retrieved:", concernId);

      const docSnapshot = await getDoc(doc(db, "Concerns", concernId));
      const concernData = docSnapshot.data();

      console.log("concernData:", concernData);

      console.log("00000 Concern ID retrieved:", concernId);

      navigate("/chat", {
        state: {
          concernId: concernId,
          agentId: concernData.agentEmail,
          agentName: concernData.agentName,
          customerId: concernData.customerEmail,
        },
      });
    } catch (error) {
      console.error("Error creating concern:", error);
    }
  };

  const getMessanger = (msg) => {
    if (msg.senderId == agentId) {
      return "You";
    } else {
      if (selectedConcern.agentEmail == agentId) {
        return selectedConcern.customerName;
      }
      return selectedConcern.agentName;
    }
  };

  const handleConcernClick = async (concern) => {
    console.log("concern", concern);
    setSelectedConcern(concern);
    setMessages([]);

    // Fetch the messages for the selected concern, ordered by timestamp
    const messagesQuery = query(
      collection(doc(db, "Concerns", concern.id), "messages"),
      orderBy("timestamp")
    );
    const querySnapshot = await getDocs(messagesQuery);
    const concernMessages = querySnapshot.docs.map((doc) => doc.data());
    console.log("concernMessages", concernMessages);
    setMessages(concernMessages);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  const handleSendMessage = async () => {
    if (!concernText || !selectedConcern) return;

    try {
      // Add the new message to the "messages" subcollection under the selected concern
      let type = "";
      if (selectedConcern.agentEmail == agentId) {
        type = "agent";
      } else if (selectedConcern.customerEmail == agentId) {
        type = "customer";
      }
      console.log("Hereeee 123", type);
      await addDoc(
        collection(doc(db, "Concerns", selectedConcern.id), "messages"),
        {
          text: concernText,
          senderId: agentId,
          timestamp: new Date(),
          type: type,
          receiverId: selectedConcern.customerEmail,
        }
      );

      await updateDoc(doc(db, "Concerns", selectedConcern.id), {
        isActive: false,
      });

      setConcernText("");

      // Reload messages ordered by timestamp
      const messagesQuery = query(
        collection(doc(db, "Concerns", selectedConcern.id), "messages"),
        orderBy("timestamp")
      );
      const querySnapshot = await getDocs(messagesQuery);
      const concernMessages = querySnapshot.docs.map((doc) => doc.data());
      setMessages(concernMessages);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  const handleChange = (event) => {
    setReferenceId(event.target.value);
  };

  return (
    <Box
      sx={{
        p: 4,
        maxWidth: 1200,
        mx: "auto",
        backgroundColor: "#f9f9f9",
        borderRadius: 3,
      }}
    >
      {/* Main Header */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          mb: 5,
          textAlign: "center",
        }}
      >
        Agent Home
      </Typography>

      {/* Raise Concern Section */}
      <Paper
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 2,
          border: "1px solid #e0e0e0",
        }}
      >
        <RaiseConcernCard
          dataProcess={dataProcess}
          referenceId={referenceId}
          concernText={concernText}
          handleChange={handleChange}
          setConcernText={setConcernText}
          createConcern={createConcern}
        />
      </Paper>

      {/* Concerns Section */}
      <Paper
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 2,
          border: "1px solid #e0e0e0",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: "500",
          }}
        >
          Concerns Overview
        </Typography>
        <ConcernsTab
          loading={loading}
          assignedConcerns={assignedConcerns}
          raisedConcerns={raisedConcerns}
          handleConcernClick={handleConcernClick}
        />
      </Paper>

      {/* Chat Drawer */}
      <ChatDrawer
        selectedConcern={selectedConcern}
        messages={messages}
        agentId={agentId}
        concernText={concernText}
        setConcernText={setConcernText}
        handleSendMessage={handleSendMessage}
        getMessanger={getMessanger}
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </Box>
  );
};

export default PubsubAgentHome;
