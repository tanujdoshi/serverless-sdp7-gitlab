import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  db,
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "../Chat/firebase";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  Grid,
  CardContent,
  Card,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { getAllDataProcess } from "../../api/apiService";

const PubsubClientHome = () => {
  const customerId = localStorage.getItem("userEmail");
  const [concernText, setConcernText] = useState("");
  // const [refrenceId, setRefrenceId] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [error, setError] = useState(null);
  const [concerns, setConcerns] = useState([]); // State to hold the concerns data
  const [loading, setLoading] = useState(true);
  const [dataProcess, setDataProcess] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Received customerId:", customerId); // Debugging
  }, [customerId]);

  // Fetch concerns from Firestore

  useEffect(() => {
    const fetchDataProcess = async () => {
      try {
        const res = await getAllDataProcess(customerId);
        setDataProcess(res.data);
      } catch (error) {
        console.error("Error fetching concerns:", error);
      }
    };
    fetchDataProcess();
  }, [customerId]);

  const handleChange = (event) => {
    setReferenceId(event.target.value);
  };
  useEffect(() => {
    if (!customerId) return;

    const fetchConcerns = async () => {
      setLoading(true);
      try {
        // Query Firestore for concerns related to the current customer
        const q = query(
          collection(db, "Concerns"),
          where("customerId", "==", customerId)
        );
        const querySnapshot = await getDocs(q);

        // Map through the results and store them in state
        const concernsData = querySnapshot.docs.map((doc) => ({
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
    console.log("Reference Id:", referenceId);

    if (!customerId || !concernText || !referenceId) {
      setError("Please provide all details.");
      return;
    }
    setError(null);

    try {
      // Fetch a random agent
      // const response = await axios.get(
      //   "https://5q5nra43v3.execute-api.us-east-1.amazonaws.com/dev/random-agent"
      // );
      // const agent = JSON.parse(response.data.body);

      // console.log("Agent data from API:", agent); // Log agent data for debugging

      // Check if agentId exists in the response
      // if (!agent.userId) {
      //   setError("Agent data is not available.");
      //   return;
      // }

      // Create a new concern document in Firestore
      const concernRef = await addDoc(collection(db, "Concerns"), {
        refrenceId: referenceId,
        // concernId: concernRef.id,
        concerntext: concernText,
        customerId: customerId,
        // customerName: customerName,
        // agentName: agent.name,
        // agentId: agent.userId,
        agentId: "dharmik@gmail.com", 
        agentName: "Dharmik",
        isActive: true,
      });

      console.log("New concern created with id:", concernRef.id);

      // Redirect to the Chat page with concernId and agentId as state parameters
      navigate("/chat", {
        //state: { concernId: concernRef.id, agentId: agent.userId },
        state: { concernId: concernRef.id, agentId: "dharmik@gmail.com", agentName: "Dharmik", customerId: customerId },
      });
    } catch (error) {
      console.error("Error creating concern:", error);
      setError("An error occurred while creating your concern.");
    }
  };

  const handleOpenChat = (concern) => {
    navigate("/chat", {
      state: { concernId: concern.id, agentId: concern.agentId, agentName: concern.agentName, customerId: customerId },
    });   
  };

  return (
    <Box
      sx={{
        p: 4,
        maxWidth: 800,
        mx: "auto",
        backgroundColor: "#f9f9f9",
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      {/* Create a New Concern Section */}
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        Create a New Concern
      </Typography>

      <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {/* <TextField
                label="Reference ID"
                value={referenceId}
                onChange={(e) => setreferenceId(e.target.value)}
                fullWidth
                variant="outlined"
              />
              */}
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Concern Text"
                value={concernText}
                onChange={(e) => setConcernText(e.target.value)}
                fullWidth
                multiline
                rows={3}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={createConcern}
                fullWidth
                size="large"
                sx={{
                  textTransform: "none",
                  backgroundColor: "#1976d2",
                  ":hover": { backgroundColor: "#1565c0" },
                }}
              >
                Submit Concern
              </Button>
            </Grid>
          </Grid>
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Your Concerns Section */}
      <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
        Your Concerns
      </Typography>

      <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          {loading ? (
            <Typography sx={{ textAlign: "center" }}>
              Loading concerns...
            </Typography>
          ) : concerns.length === 0 ? (
            <Typography sx={{ textAlign: "center" }}>
              No concerns found.
            </Typography>
          ) : (
            <List>
              {concerns.map((concernDoc) => (
                <ListItem
                  key={concernDoc.id}
                  button
                  onClick={() => handleOpenChat(concernDoc)}
                  sx={{
                    mb: 1,
                    border: "1px solid #ddd",
                    borderRadius: 1,
                    p: 1.5,
                    backgroundColor: "#f5f5f5",
                    ":hover": {
                      backgroundColor: "#e0e0e0",
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold" }}
                      >
                        {concernDoc.concerntext}
                      </Typography>
                    }
                    secondary={`Reference ID: ${concernDoc.refrenceId}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PubsubClientHome;
