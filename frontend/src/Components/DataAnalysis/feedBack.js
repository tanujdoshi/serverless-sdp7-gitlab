import {React} from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { TextField, Button, MenuItem, Box, Typography, Select, FormControl, InputLabel } from "@mui/material";


const FeedbackForm = () => {
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState("");
    const [feedback, setFeedback] = useState("");

    const userEmail = localStorage.getItem("userEmail");
    useEffect(()=>{
        axios.get(
  "https://kdhprlykjeacymoqef22co3ie40unnqa.lambda-url.us-east-1.on.aws/",
  { userEmail },
  {
    headers: {
      "Content-Type": "application/json", // Set only if necessary
    },
  }
)       .then((res)=>{
            setTasks(res.data);
        })
        .catch((err)=>{
            console.log(err);
        })
    },[])

    const handleSubmit = (e) => {  
        e.preventDefault();
        const {process_id, filename, type} = selectedTask;
        axios
        .post("https://us-central1-serverless-pro-442123.cloudfunctions.net/feedd3", {
          userEmail: userEmail,
          process_id,
          fileName:filename,
          dpType:type,
          feed:feedback,
        },{
            headers: {
                "Content-Type": "application/json", // Set only if necessary
            },
        })
        .then(() => alert("Feedback submitted!"))
        .catch((error) => console.error(error));
    };
    
    return(
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
            {tasks.map((task, index) => (
              <MenuItem key={index} value={task}>
                {`${task.process_id} - ${task.type} (${task.filename})`}
              </MenuItem>
            ))}
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

    )

}

export default FeedbackForm;