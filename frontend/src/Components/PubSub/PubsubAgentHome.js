import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { getAllDataProcess } from "../../api/apiService";
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

const PubsubAgentHome = () => {
  const agentId = localStorage.getItem("userEmail");
  const [concernText, setConcernText] = useState("");
  const [refrenceId, setReferenceId] = useState("");
  const [concerns, setConcerns] = useState([]);
  const [dataProcess, setDataProcess] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConcern, setSelectedConcern] = useState(null); // Track selected concern
  const [messages, setMessages] = useState([]); // Messages for the selected concern

  useEffect(() => {
    const fetchConcerns = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "Concerns"));
        const agentConcerns = querySnapshot.docs.filter(
          (doc) => doc.data().agentId === agentId
        );
        setConcerns(agentConcerns);
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

  const createConcern = async () => {
    if (!concernText || !refrenceId) return;

    try {
      // Get all agents excluding the current agent
      // const response = await axios.get(
      //   "https://5q5nra43v3.execute-api.us-east-1.amazonaws.com/dev/random-agent"
      // );
      // const agents = response.data.filter((agent) => agent.userId !== agentId); // Exclude the current agent  

      // Select a random agent
      // const agent = agents[Math.floor(Math.random() * agents.length)];

      // Create a new concern document
      await addDoc(collection(db, "Concerns"), {
        refrenceId: refrenceId,
        concerntext: concernText,
        // agentId: agent.userId, // Assign a random agent
        // agentName: agent.name,
        agentId: "dharmik@gmail.com", 
        agentName: "Dharmik",
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
    const concernMessages = querySnapshot.docs.map((doc) => doc.data());
    setMessages(concernMessages);
  };

  const handleSendMessage = async () => {
    if (!concernText || !selectedConcern) return;    

    try {
      // Add the new message to the "messages" subcollection under the selected concern
      await addDoc(
        collection(doc(db, "Concerns", selectedConcern.id), "messages"),
        {
          text: concernText,
          senderId: agentId,
          timestamp: new Date(),
          type: "agent", // Type can be "agent" or "customer",
          receiverId: selectedConcern.data().customerId,
        }
      );

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
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Agent Home
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardHeader title="Raise a Concern" />
        <CardContent>
          {/* <TextField
            label="Reference ID"
            value={referenceId}
            onChange={(e) => setreferenceId(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          /> */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <Select
              labelId="reference-id-label"
              value={refrenceId}
              onChange={handleChange}
              label="Reference ID"
            >
              {dataProcess.map((process) => (
                <MenuItem
                  key={process.process_id}
                  value={`${process.process_id} - ${process.filename}`}
                >
                  {`${process.process_id} - ${process.filename}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Concern Text"
            value={concernText}
            onChange={(e) => setConcernText(e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={createConcern} fullWidth>
            Raise Concern
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Assigned Concerns" />
        <CardContent>
          {loading ? (
            <Typography>Loading concerns...</Typography>
          ) : concerns.length === 0 ? (
            <Typography>No concerns assigned to you.</Typography>
          ) : (
            <List>
              {concerns.map((concern) => (
                <ListItem
                  key={concern.id}
                  button
                  onClick={() => handleConcernClick(concern)}
                  sx={{
                    mb: 1,
                    border: "1px solid #ddd",
                    borderRadius: 1,
                    p: 1.5,
                  }}
                >
                  <ListItemText
                    primary={concern.data().concerntext}
                    secondary={`Reference ID: ${concern.data().refrenceId}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {selectedConcern && (
        <Card sx={{ mt: 3 }}>
          <CardHeader
            title={`Chat for Concern: ${selectedConcern.data().concerntext}, ${selectedConcern.data().customerId}`}
          />
          <Divider />
          <CardContent>
            <List sx={{ maxHeight: 300, overflowY: "auto", mb: 2 }}>
              {messages.map((msg, index) => (
                <ListItem key={index}>
                  <Typography
                    variant="body2"
                    sx={{
                      backgroundColor:
                        msg.senderId === agentId ? "#e3f2fd" : "#f1f8e9",
                      p: 1,
                      borderRadius: 1,
                      display: "inline-block",
                      maxWidth: "75%",
                    }}
                  >
                    <strong>
                      {msg.senderId === agentId ? "You" : "Customer"}:
                    </strong>{" "}
                    {msg.text}
                  </Typography>
                </ListItem>
              ))}
            </List>
            <TextField
              label="Your Message"
              value={concernText}
              onChange={(e) => setConcernText(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={handleSendMessage} fullWidth>
              Send Message
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default PubsubAgentHome;
