import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { db, collection, addDoc, query, orderBy, onSnapshot } from "./firebase";
import {
  Box,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  Paper,
} from "@mui/material";

const Chat = () => {
  const location = useLocation();
  const { concernId, agentId, agentName, customerId } = location.state || {}; // Retrieve concernId and agentId from location state
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

    useEffect(() => {
        console.log("Concern ID:", concernId);
        console.log("Agent ID:", agentId);
        console.log("Agent Name:", agentName);
        console.log("Customer ID:", customerId);
    }, [concernId, agentId, agentName, customerId]);

  const senderType = "customer";

  // Function to send message to Firestore
  const sendMessage = async () => {
    if (!concernId || !message.trim()) return; // Prevent empty messages

    try {
      await addDoc(collection(db, "Concerns", concernId, "messages"), {
        text: message,
        senderId: customerId,
        timestamp: new Date(),
        type: senderType,
        receiverId: agentId,
      });
      setMessage(""); // Clear message input after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Fetch messages from Firestore when concernId is available
  useEffect(() => {
    console.log("Concern ID:", concernId);
    // console.log("userId:", userId);
    console.log("customerId:", customerId);
    // console.log("isAgent:", isAgent);

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
  // }, [concernId, userId, customerId, isAgent]);
}, [concernId, customerId]);

  return (
    <Box
      sx={{
        p: 4,
        maxWidth: 600,
        mx: "auto",
        backgroundColor: "#f9f9f9",
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      {/* Chat Header */}
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          textAlign: "center",
          color: "#1976d2",
          fontWeight: "bold",
        }}
      >
        {`You're in conversation with Agent ${agentName}` || "Chat with your Agent"}
      </Typography>

      {/* Messages Section */}
      <Paper
        elevation={3}
        sx={{
          my: 2,
          p: 2,
          height: 400,
          overflowY: "auto",
          backgroundColor: "#ffffff",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            borderBottom: "1px solid #ddd",
            pb: 1,
            fontWeight: "bold",
            color: "#4caf50",
          }}
        >
          Messages
        </Typography>
        <List>
          {messages.length === 0 ? (
            <Typography
              variant="body2"
              sx={{ textAlign: "center", color: "#888" }}
            >
              No messages yet. Start the conversation!
            </Typography>
          ) : (
            messages.map((msg, index) => (
              <ListItem
                key={index}
                sx={{
                  justifyContent:
                    msg.type === "customer" ? "flex-end" : "flex-start",
                  p: 1,
                  display: "flex",
                }}
              >
                <Box
                  sx={{
                    backgroundColor:
                      msg.type === "customer" ? "#e3f2fd" : "#f1f8e9",
                    p: 1.5,
                    borderRadius: 2,
                    maxWidth: "70%",
                    boxShadow: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      wordWrap: "break-word",
                      fontWeight: "bold",
                      color: msg.type === "customer" ? "#1976d2" : "#4caf50",
                    }}
                  >
                    {msg.type === "customer" ? "You" : agentName || "Agent"}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {msg.text}
                  </Typography>
                </Box>
              </ListItem>
            ))
          )}
        </List>
      </Paper>

      {/* Message Input Section */}
      <Box
        component="form"
        sx={{
          mt: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <TextField
          label="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          fullWidth
          multiline
          rows={2}
          variant="outlined"
        />
        <Button
          variant="contained"
          onClick={sendMessage}
          disabled={!message.trim()}
          fullWidth
          size="large"
          sx={{
            textTransform: "none",
            backgroundColor: "#1976d2",
            ":hover": { backgroundColor: "#1565c0" },
          }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default Chat;
