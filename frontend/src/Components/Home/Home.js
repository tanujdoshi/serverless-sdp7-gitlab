import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, collection, addDoc } from "../Chat/firebase";
import axios from "axios";
import { Box, Button, TextField, Typography } from "@mui/material";

const Home = ({ customerId }) => {
  const [concernText, setConcernText] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const createConcern = async () => {
    console.log("CustomerId:", customerId);
    console.log("ConcernText:", concernText); 
    if (!customerId || !concernText) {
      setError("Please provide all details.");
      return;
    }
    setError(null);

    try {
      // Fetch a random agent
      const response = await axios.get("https://5q5nra43v3.execute-api.us-east-1.amazonaws.com/dev/random-agent");
      const agent = response.data;

      // Create a new concern document in Firestore
      const concernRef = await addDoc(collection(db, "Concerns"), {
        customerId: customerId,
        agentId: agent.agentId,
        refrenceId: "12345",
        concerntext: concernText,
      });

      // Redirect to the Chat page with concernId and agentId as state parameters
      navigate("/chat", { state: { concernId: concernRef.id, agentId: agent.agentId } });
    } catch (error) {
      console.error("Error creating concern:", error);
      setError("An error occurred while creating your concern.");
    }
  };

  return (
    <Box>
      <Typography variant="h4">Create a New Concern</Typography>
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
    </Box>
  );
};

export default Home;
