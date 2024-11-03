import React, { useEffect, useState } from "react";
import { db, collection, addDoc, query, where, orderBy, limit, getDocs, onSnapshot } from "../../Config/firebase";
import { Box, Button, TextField, Typography, List, ListItem, Paper } from "@mui/material";

const Chat = ({ customerId, agentId }) => {
  const [concernId, setConcernId] = useState(null);
  const [message, setMessage] = useState("");
  const [concerns, setConcerns] = useState([]);
  const [messages, setMessages] = useState([]);
  const [concernText, setConcernText] = useState("");

  // Create a new concern
  const createConcern = async () => {
    if (!customerId) {
        console.error("Customer ID is missing.");
        return;
      }
    try {
      const concernRef = await addDoc(collection(db, "Concerns"), {
        customerId: customerId,
        agentId: agentId,
        refrenceId: "12345", // static reference id
        concerntext: concernText,
      });
      setConcernId(concernRef.id);
      console.log("New concern created with ID:", concernRef.id);
    } catch (error) {
      console.error("Error creating concern:", error);
    }
  };

  // Send a message to the selected concern
  const sendMessage = async (senderId, text) => {
    if (!concernId) return;
    try {
      await addDoc(collection(db, "Concerns", concernId, "messages"), {
        text,
        senderId,
        timestamp: new Date(),
        type: senderId === customerId ? "customer" : "agent",
      });
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Fetch previous messages with pagination (last 20 messages)
  const fetchMessages = async (id) => {
    try {
      const messageQuery = query(
        collection(db, "Concerns", id, "messages"),
        orderBy("timestamp", "desc"),
        limit(20)
      );
      const messageSnapshot = await getDocs(messageQuery);
      setMessages(messageSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Fetch concerns by customerId
  const fetchCustomerConcerns = async () => {
    try {
      const concernsQuery = query(collection(db, "Concerns"), where("customerId", "==", customerId));
      const concernSnapshot = await getDocs(concernsQuery);
      setConcerns(concernSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching customer concerns:", error);
    }
  };

  // Fetch concerns by agentId
  const fetchAgentConcerns = async () => {
    try {
      const concernsQuery = query(collection(db, "Concerns"), where("agentId", "==", agentId));
      const concernSnapshot = await getDocs(concernsQuery);
      setConcerns(concernSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching agent concerns:", error);
    }
  };

  // Listen for real-time updates in messages
  useEffect(() => {
    if (!concernId) return;

    const messagesRef = collection(db, "Concerns", concernId, "messages");
    const unsubscribe = onSnapshot(query(messagesRef, orderBy("timestamp", "asc")), (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [concernId]);

  return (
    <Box>
      <Typography variant="h4">QDP Chat</Typography>
      
      {/* Create Concern Section */}
      <Box sx={{ my: 2 }}>
        <TextField
          label="Concern Text"
          value={concernText}
          onChange={(e) => setConcernText(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={createConcern} sx={{ mt: 1 }}>
          Create Concern
        </Button>
      </Box>
      
      {/* Message Sending Section */}
      <Box sx={{ my: 2 }}>
        <TextField
          label="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={() => sendMessage(customerId, message)} sx={{ mt: 1 }}>
          Send as Customer
        </Button>
        <Button variant="contained" onClick={() => sendMessage(agentId, message)} sx={{ mt: 1, ml: 1 }}>
          Send as Agent
        </Button>
      </Box>

      {/* List of Concerns */}
      <Paper sx={{ my: 2, p: 2 }}>
        <Typography variant="h6">Concerns List</Typography>
        <Button onClick={fetchCustomerConcerns}>Fetch Customer Concerns</Button>
        <Button onClick={fetchAgentConcerns} sx={{ ml: 1 }}>Fetch Agent Concerns</Button>
        <List>
          {concerns.map((concern) => (
            <ListItem key={concern.id} onClick={() => setConcernId(concern.id)}>
              {concern.concerntext}
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Display Messages */}
      <Paper sx={{ my: 2, p: 2 }}>
        <Typography variant="h6">Messages</Typography>
        <List>
          {messages.map((msg) => (
            <ListItem key={msg.id}>
              <Typography variant="body2">
                <strong>{msg.type === "customer" ? "Customer" : "Agent"}:</strong> {msg.text}
              </Typography>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Chat;