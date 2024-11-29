import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
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
import { UserContext } from "../Context/UserContext";

const PubsubAgentHome = () => {
  const { userData } = useContext(UserContext);
  const agentId = localStorage.getItem("userEmail");
  const [concernText, setConcernText] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [concerns, setConcerns] = useState([]);
  const [assignedConcerns, setAssignedConcerns] = useState([]);
  const [raisedConcerns, setRaisedConcerns] = useState([]);
  const [dataProcess, setDataProcess] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConcern, setSelectedConcern] = useState(null); // Track selected concern
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
    const maxRetries = 10; // Maximum retries
    const delay = 1000; // 1 second delay
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
        name: userData.name, // The agent's name
        email: agentId, // The agent's email
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

      // Wait for Firestore document creation
      const concernId = await waitForFirestoreDocument(referenceId);

      console.log("Concern ID retrieved:", concernId);

      // Retrieve the Firestore document details
      const docSnapshot = await getDoc(doc(db, "Concerns", concernId));
      const concernData = docSnapshot.data();

      console.log("concernData:", concernData);

      console.log("00000 Concern ID retrieved:", concernId);

      // Redirect to the Chat component
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
    setMessages([]); // Clear previous messages

    // Fetch the messages for the selected concern, ordered by timestamp
    const messagesQuery = query(
      collection(doc(db, "Concerns", concern.id), "messages"),
      orderBy("timestamp") // Order by timestamp field
    );
    const querySnapshot = await getDocs(messagesQuery);
    const concernMessages = querySnapshot.docs.map((doc) => doc.data());
    console.log("concernMessages", concernMessages);
    setMessages(concernMessages);
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
          type: type, // Type can be "agent" or "customer",
          receiverId: selectedConcern.customerEmail,
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
              value={referenceId}
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

      {/*<Card>
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
                    primary={concern.concernText}
                    secondary={`Reference ID: ${concern.referenceId}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>*/}

      <Card sx={{ mb: 3 }}>
        <CardHeader title="Assigned Concerns" />
        <CardContent>
          {loading ? (
            <Typography>Loading assigned concerns...</Typography>
          ) : assignedConcerns.length === 0 ? (
            <Typography>No concerns assigned to you.</Typography>
          ) : (
            <List>
              {assignedConcerns.map((concern) => (
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
                    primary={concern.concernText}
                    secondary={`Reference ID: ${concern.referenceId}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Raised Concerns" />
        <CardContent>
          {loading ? (
            <Typography>Loading raised concerns...</Typography>
          ) : raisedConcerns.length === 0 ? (
            <Typography>No concerns raised by you.</Typography>
          ) : (
            <List>
              {raisedConcerns.map((concern) => (
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
                    primary={concern.concernText}
                    secondary={`Reference ID: ${concern.referenceId}`}
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
            title={`Chat for Concern: ${selectedConcern.concernText} with ${selectedConcern.customerName}`}
          />
          <Divider />
          <CardContent>
            <List sx={{ maxHeight: 300, overflowY: "auto", mb: 2 }}>
              {messages.map((msg, index) => (
                <>
                  <ListItem
                    key={index}
                    sx={{
                      justifyContent:
                        getMessanger(msg) == "You" ? "flex-end" : "flex-start",
                      p: 1,
                      display: "flex",
                    }}
                  >
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
                      <strong>{getMessanger(msg)}:</strong> {msg.text}
                    </Typography>
                  </ListItem>
                </>
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
