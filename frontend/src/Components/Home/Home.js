import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, collection, addDoc, getDocs, query, where } from "../Chat/firebase";
import axios from "axios";
import { Box, Button, TextField, Typography, List, ListItem, ListItemText } from "@mui/material";

const Home = ({ customerId }) => {
  const [concernText, setConcernText] = useState("");
  const [refrenceId, setRefrenceId] = useState("");
  const [error, setError] = useState(null);
  const [concerns, setConcerns] = useState([]); // State to hold the concerns data
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Received customerId:", customerId); // Debugging
  }, [customerId]);

  // Fetch concerns from Firestore 

  useEffect(() => {
    if (!customerId) return;

    const fetchConcerns = async () => {
      setLoading(true);
      try {
        // Query Firestore for concerns related to the current customer
        const q = query(collection(db, "Concerns"), where("customerId", "==", customerId));
        const querySnapshot = await getDocs(q);

        // Map through the results and store them in state
        const concernsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setConcerns(concernsData);
      } catch (error) {
        console.error("Error fetching concerns:", error);
        setError("An error occurred while fetching your concerns.");
      } finally {
        setLoading(false);
      }
    };

    fetchConcerns();
  }, [customerId]);

  const createConcern = async () => {
    console.log("CustomerId:", customerId);
    console.log("ConcernText:", concernText);
    console.log("Reference Id:", refrenceId);


    if (!customerId || !concernText || !refrenceId) {
      setError("Please provide all details.");
      return;
    }
    setError(null);

    try {
      // Fetch a random agent
      const response = await axios.get("https://5q5nra43v3.execute-api.us-east-1.amazonaws.com/dev/random-agent");
      const agent = JSON.parse(response.data.body);


      console.log("Agent data from API:", agent); // Log agent data for debugging

      // Check if agentId exists in the response
      if (!agent.userId) {
        setError("Agent data is not available.");
        return;
      }

      // Create a new concern document in Firestore
      const concernRef = await addDoc(collection(db, "Concerns"), {
        refrenceId: refrenceId,
        // concernId: concernRef.id,
        concerntext: concernText,
        customerId: customerId,
        // customerName: "ABC" 
        agentName: agent.name,
        agentId: agent.userId,
        isActive: true
      });

      console.log("New concern created with id:", concernRef.id);

      // Redirect to the Chat page with concernId and agentId as state parameters
      navigate("/chat", { state: { concernId: concernRef.id, agentId: agent.userId } });
    } catch (error) {
      console.error("Error creating concern:", error);
      setError("An error occurred while creating your concern.");
    }
  };

  const handleOpenChat = (concern) => {
    navigate("/chat", { state: { concernId: concern.id, agentId: concern.agentId } });
  };


  return (
    <Box>
      <Typography variant="h4">Create a New Concern</Typography>

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
      />
      <Button variant="contained" onClick={createConcern} sx={{ mt: 2 }}>
        Submit Concern
      </Button>
      {error && <Typography color="error">{error}</Typography>}

      <Typography variant="h5" sx={{ mt: 4 }}>Your Concerns</Typography>

      {loading ? (
        <Typography>Loading concerns...</Typography>
      ) : (
        <List>
          {concerns.length === 0 ? (
            <Typography>No concerns found.</Typography>
          ) : (
            concerns.map((concernDoc) => (
              <ListItem key={concernDoc.id} button onClick={() => handleOpenChat(concernDoc)}>
                <ListItemText
                  primary={`Concern: ${concernDoc.concerntext}`}
                  secondary={`Reference ID: ${concernDoc.refrenceId}`}
                />
              </ListItem>
            ))
          )}
        </List>
      )}

    </Box>
  );
};

export default Home;
