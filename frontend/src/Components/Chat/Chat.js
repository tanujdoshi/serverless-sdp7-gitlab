import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { db, collection, addDoc, query, orderBy, onSnapshot } from "./firebase";
import { Box, Button, TextField, Typography, List, ListItem, Paper } from "@mui/material";

const Chat = ({ customerId }) => {
  const location = useLocation();
  const { concernId, agentId } = location.state || {}; // Retrieve concernId and agentId from location state
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

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
      <Typography variant="h4">Chat with Agent</Typography>
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
      </Box>
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
