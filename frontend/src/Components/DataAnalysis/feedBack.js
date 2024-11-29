import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, MenuItem, Box, Typography, Select, FormControl, InputLabel } from "@mui/material";

const FeedbackForm = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [feedback, setFeedback] = useState("");
  const userEmail = localStorage.getItem("userEmail");

  // Fetch tasks from the API when the component mounts
  useEffect(() => {
    axios
      .post("https://fsywgygjrg.execute-api.us-east-1.amazonaws.com/dev/dp/getAllByEmail", {
        userEmail,
      })
      .then((res) => {
        const rawTasks = typeof res.data.body === "string" ? JSON.parse(res.data.body) : res.data.body;
        const fetchedTasks = Array.isArray(rawTasks) ? rawTasks : [];
        setTasks(fetchedTasks);
      })
      .catch((err) => {
        console.error("Error fetching tasks:", err);
        setTasks([]);
      });
  }, []);

   // Define a function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
     // Check if a task has been selected
    if (!selectedTask) {
      alert("Please select a task before submitting feedback.");
      return;
    }

    // Extract task details from the selected task
    const { process_id, filename, type } = JSON.parse(selectedTask); // Parse the serialized task
    // Submit the feedback to the API
    axios
      .post(
        "https://us-central1-serverless-pro-442123.cloudfunctions.net/addfeedback",
        {
          userEmail,
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
      .then(() => { // Handle successful feedback submission
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
    <div style={{ padding: "40px" }}>
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
                <MenuItem key={index} value={JSON.stringify(task)}>
                  {`${task.process_id} ${task.type} - ${task.filename}`}
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
        <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>
          Submit
        </Button>
      </Box>
    </div>
  );
};

export default FeedbackForm;
