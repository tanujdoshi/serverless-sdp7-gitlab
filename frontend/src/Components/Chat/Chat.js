import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { db, collection, addDoc, query, orderBy, onSnapshot } from "./firebase";
import { Box, Button, TextField, Typography, List, ListItem, Paper } from "@mui/material";

const Chat = ({ userId, isAgent }) => {
  const location = useLocation();
  const { concernId, agentId, customerId } = location.state || {}; // Retrieve concernId and agentId from location state
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const senderType = isAgent ? "agent" : "customer";

  // Function to send message to Firestore
  const sendMessage = async () => {
    if (!concernId || !message.trim()) return;  // Prevent empty messages

    try {
      await addDoc(collection(db, "Concerns", concernId, "messages"), {
        text: message,
        senderId: userId,
        timestamp: new Date(),
        type: senderType,
      });
      setMessage(""); // Clear message input after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Fetch messages from Firestore when concernId is available
  useEffect(() => {
    console.log("Concern ID:", concernId);
    console.log("userId:", userId);
    console.log("customerId:", customerId);
    console.log("isAgent:", isAgent);

    // if (!concernId || (!isAgent && userId !== customerId)) {
    //   console.log("Invalid concernId or user mismatch");
    //   return;
    // }

    if (!concernId || !userId) return; // Skip if concernId or userId is not available

    const messagesRef = collection(db, "Concerns", concernId, "messages");
    const unsubscribe = onSnapshot(
      query(messagesRef, orderBy("timestamp", "asc")),
      (snapshot) => {
        if (snapshot.empty) {
          console.log("No messages found in Firestore");
        } else {
          const loadedMessages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log("Messages fetched:", loadedMessages);
          setMessages(loadedMessages);
        }
      },
      (error) => {
        console.error("Error fetching messages:", error);
      }
    );

    return () => unsubscribe(); // Cleanup on component unmount
  }, [concernId, userId, customerId, isAgent]);

  return (
    <Box>
      <Typography variant="h4">Chat with {isAgent ? "Customer" : "Agent"}</Typography>
      <Box sx={{ my: 2 }}>
        <TextField
          label="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          onClick={sendMessage}
          sx={{ mt: 1 }}
          disabled={!message.trim()} // Disable send button when message is empty
        >
          Send
        </Button>
      </Box>
      <Paper sx={{ my: 2, p: 2 }}>
        <Typography variant="h6">Messages</Typography>
        <List>
          {messages.map((msg) => (
            <ListItem button key={msg.id}>
              <Typography variant="body2">
                <strong>{msg.type === "customer" ? "You" : "Agent"}:</strong> {msg.text}
              </Typography>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Chat;
