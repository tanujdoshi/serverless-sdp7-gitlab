import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, List, ListItem, ListItemText } from "@mui/material";
import axios from "axios";
import { db, collection, addDoc, getDocs, doc, query, where, getDoc, updateDoc, orderBy } from "../Chat/firebase";

const AgentHome = ({ agentId }) => {
  const [concernText, setConcernText] = useState("");
  const [refrenceId, setRefrenceId] = useState("");
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConcern, setSelectedConcern] = useState(null); // Track selected concern
  const [messages, setMessages] = useState([]); // Messages for the selected concern

  useEffect(() => {
    const fetchConcerns = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "Concerns"));
        const agentConcerns = querySnapshot.docs.filter(doc => doc.data().agentId === agentId);
        setConcerns(agentConcerns);
      } catch (error) {
        console.error("Error fetching concerns:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConcerns();
  }, [agentId]);

  const createConcern = async () => {
    if (!concernText || !refrenceId) return;

    try {
      // Get all agents excluding the current agent
      const response = await axios.get("https://5q5nra43v3.execute-api.us-east-1.amazonaws.com/dev/random-agent");
      const agents = response.data.filter(agent => agent.userId !== agentId); // Exclude the current agent

      // Select a random agent
      const agent = agents[Math.floor(Math.random() * agents.length)];

      // Create a new concern document
      await addDoc(collection(db, "Concerns"), {
        refrenceId,
        concerntext: concernText,
        agentId: agent.userId, // Assign a random agent
        agentName: agent.name,
        isActive: true,
      });

      setConcernText(""); // Clear the input after submitting
    } catch (error) {
      console.error("Error creating concern:", error);
    }
  };

  const handleConcernClick = async (concern) => {
    setSelectedConcern(concern);
    setMessages([]); // Clear previous messages
  
    // Fetch the messages for the selected concern, ordered by timestamp
    const messagesQuery = query(
      collection(doc(db, "Concerns", concern.id), "messages"),
      orderBy("timestamp") // Order by timestamp field
    );
    const querySnapshot = await getDocs(messagesQuery);
    const concernMessages = querySnapshot.docs.map(doc => doc.data());
    setMessages(concernMessages);
  };
  

  const handleSendMessage = async () => {
    if (!concernText || !selectedConcern) return;
  
    try {
      // Add the new message to the "messages" subcollection under the selected concern
      await addDoc(collection(doc(db, "Concerns", selectedConcern.id), "messages"), {
        text: concernText,
        senderId: agentId,
        timestamp: new Date(),
        type: "agent", // Type can be "agent" or "customer"
      });
  
      // Optionally, update the concern status if necessary
      await updateDoc(doc(db, "Concerns", selectedConcern.id), {
        isActive: false, // Set concern to inactive after reply (if required)
      });
  
      setConcernText(""); // Clear the input after sending
  
      // Reload messages ordered by timestamp
      const messagesQuery = query(
        collection(doc(db, "Concerns", selectedConcern.id), "messages"),
        orderBy("timestamp") // Order by timestamp field
      );
      const querySnapshot = await getDocs(messagesQuery);
      const concernMessages = querySnapshot.docs.map(doc => doc.data());
      setMessages(concernMessages);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  

  return (
    <Box>
      <Typography variant="h4">Agent Home</Typography>

      {/* List of concerns */}
      {loading ? (
        <Typography>Loading concerns...</Typography>
      ) : (
        <List>
          {concerns.length === 0 ? (
            <Typography>No concerns assigned to you.</Typography>
          ) : (
            concerns.map((concern) => (
              <ListItem button key={concern.id} onClick={() => handleConcernClick(concern)}>
                <ListItemText
                  primary={`Concern: ${concern.data().concerntext}`}
                  secondary={`Refrence ID: ${concern.data().refrenceId}`}
                />
              </ListItem>
            ))
          )}
        </List>
      )}

      {/* If a concern is selected, show the chat interface */}
      {selectedConcern && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5">Chat for Concern: {selectedConcern.data().refrenceId}</Typography>

          <List sx={{ maxHeight: 300, overflowY: "auto" }}>
            {messages.map((msg, index) => (
              <ListItem key={index}>
                {/* <ListItemText
                  primary={message.text}
                  secondary={`Sent by: ${message.senderId === agentId ? "You (Agent)" : "Customer"}`}
                /> */}
                <Typography variant="body2">
                    <strong>{msg.senderId === agentId ? "You" : "Customer"}:</strong> {msg.text}
                </Typography>
              </ListItem>
            ))}
          </List>

          <TextField
            label="Your Message"
            value={concernText}
            onChange={(e) => setConcernText(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />

          <Button variant="contained" onClick={handleSendMessage} sx={{ mt: 2 }}>
            Send Message
          </Button>
        </Box>
      )}

      {/* Form for creating a new concern */}
      <Box sx={{ mt: 4 }}>
        <TextField
          label="Refrence ID"
          value={refrenceId}
          onChange={(e) => setRefrenceId(e.target.value)}
          fullWidth
          sx={{ mt: 2 }}
        />
        <TextField
          label="Concern Text"
          value={concernText}
          onChange={(e) => setConcernText(e.target.value)}
          fullWidth
          sx={{ mt: 2 }}
        />
        <Button variant="contained" onClick={createConcern} sx={{ mt: 2 }}>
          Raise Concern
        </Button>
      </Box>
    </Box>
  );
};

export default AgentHome;
