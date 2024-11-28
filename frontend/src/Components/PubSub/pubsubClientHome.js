import React, {useState, useEffect, useContext} from "react";
import { useNavigate } from "react-router-dom";
import {
  db,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc
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
import { UserContext } from "../Context/UserContext";



const waitForFirestoreDocument = async (refrenceId) => {
  const maxRetries = 10; // Maximum retries for polling
  const delay = 1000; // Delay in milliseconds between each retry
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const q = query(
          collection(db, "Concerns"),
          where("refrenceId", "==", refrenceId) // Use "refrenceId" here
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]; // Get the first matching document
        return doc.id; // Return the Firestore document ID
      }
    } catch (error) {
      console.error("Error fetching Firestore document:", error);
    }

    // Wait for the delay period before retrying
    await new Promise((resolve) => setTimeout(resolve, delay));
    retries++;
  }

  throw new Error("Timeout waiting for Firestore document creation.");
};




const PubsubClientHome = () => {
  const { userData } = useContext(UserContext);
  const customerId = localStorage.getItem("userEmail");
  const [concernText, setConcernText] = useState("");
  // const [refrenceId, setRefrenceId] = useState("");
  const [refrenceId, setRefrenceId] = useState("");
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
    setRefrenceId(event.target.value);
    console.log("Selected Reference ID:", event.target.value);
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
    console.log("Reference Id:", refrenceId);

    if (!customerId || !concernText || !refrenceId) {
      setError("Please provide all details.");
      return;
    }
    setError(null);

    try {
      // Prepare the payload for the publishConcern HTTP endpoint
      const payload = {
        name: userData.name, // Assuming customerId serves as the name
        email: customerId, // Assuming customer email is the same as ID
        refrenceId: refrenceId, // Use "refrenceId" consistently
        concernText: concernText,
      };

      // Make a POST request to the publishConcern endpoint
      const response = await axios.post(
          "https://us-central1-serverless-project-439901.cloudfunctions.net/publishConcern",
          payload
      );

      console.log("Concern successfully published with message ID:", response.data);

      // Wait for the Firestore document to be created by the subscribe function
      const concernId = await waitForFirestoreDocument(refrenceId);
      console.log("Concern ID retrieved:", concernId);

      // Fetch the agent details from Firestore (optional)
      const docSnapshot = await getDoc(doc(db, "Concerns", concernId));
      const concernData = docSnapshot.data();

      // Redirect to the Chat page with the concernId and agentId
      navigate("/chat", {
        state: {
          concernId: concernId,
          agentId: concernData.agentEmail,
          agentName: concernData.agentName,
          customerId: customerId,
        },
      });
    } catch (error) {
      console.error("Error publishing concern:", error);
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
                value={refrenceId}
                onChange={(e) => setrefrenceId(e.target.value)}
                fullWidth
                variant="outlined"
              />
              */}
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
