import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, MenuItem, Box, Typography, Select, FormControl, InputLabel } from "@mui/material";

const FeedbackForm = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [feedback, setFeedback] = useState("");
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    axios.post(
      "https://fsywgygjrg.execute-api.us-east-1.amazonaws.com/dev/dp/getAllByEmail",
      { userEmail }
    )
    .then((res) => {
      // Add error checking and logging
      console.log("Full response:", res);
      console.log("Response data:", res.data);
      
      const fetchedTasks = Array.isArray(res.data.body) ? res.data.body : [];
      setTasks(fetchedTasks);
    })
    .catch((err) => {
      console.error("Error fetching tasks:", err);
      setTasks([]);
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Add validation to ensure a task is selected
    if (!selectedTask) {
      alert("Please select a task before submitting feedback.");
      return;
    }

    const { process_id, filename, type } = selectedTask;
    
    axios.post(
      "https://us-central1-serverless-pro-442123.cloudfunctions.net/feedd3", 
      {
        userEmail: userEmail,
        process_id,
        fileName: filename,
        dpType: type,
        feed: feedback,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then(() => {
      alert("Feedback submitted!");
      setSelectedTask("");
      setFeedback("");
    })
    .catch((error) => {
      console.error("Submission error:", error);
      alert("Failed to submit feedback. Please try again.");
    });
  };

  return (
    <div style={{padding:"40px"}}>
      <Box
        sx={{
          maxWidth: 600,
          margin: "auto",
          padding: 4,
          backgroundColor: "#f9f9f9",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" mb={2}>
          Submit Feedback
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Task</InputLabel>
          <Select
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
            label="Select Task"
          >
            {tasks.length === 0 ? (
              <MenuItem value="">No tasks found</MenuItem>
            ) : (
              tasks.map((task, index) => (
                <MenuItem key={index} value={task}>
                  {`${task.process_id} - ${task.type} (${task.filename})`}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        <TextField
          label="Feedback"
          multiline
          rows={4}
          fullWidth
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSubmit} 
          fullWidth
        >
          Submit
        </Button>
      </Box>
    </div>
  );
};

export default FeedbackForm;