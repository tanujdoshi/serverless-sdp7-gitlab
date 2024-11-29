import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import axios from "axios";

// Define the FeedbackTable component
const FeedbackTable = () => {
  // Initialize state variables to store feedback data and loading status
  const [feedbackData, setFeedbackData] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Determine the feedback type based on the filename
   * @param {string} feedBackFileName - The filename to check
   * @returns {string} The feedback type (e.g. "JsonToCsv", "TxtTransform", or "Unknown")
   */
  const getFeedbackType = (feedBackFileName) => {
    if (!feedBackFileName || typeof feedBackFileName !== "string") {
      return "Unknown";
    }
    if (feedBackFileName.includes("glue")) return "JsonToCsv";
    if (feedBackFileName.includes("txt")) return "TxtTransform";
    return "Unknown";
  };

  // Fetch feedback data from the API when the component mounts
  useEffect(() => {
    axios
      .get("https://getfeedbackdetails-710015716338.us-central1.run.app")
      .then((res) => {
        // Update the feedback data state variable
        setFeedbackData(res.data);
        // Set loading to false
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  // Display a loading indicator if the data is still being fetched
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render the feedback table
  return (
    <Box sx={{ maxWidth: "90%", margin: "auto", mt: 4 }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#1976d2" }}
      >
        Feedback Results
      </Typography>
      <TableContainer component={Paper} elevation={4}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                User Email
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                Filename
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                Type
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                Feedback
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                Sentiment
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {feedbackData.map((feedback, index) => (
              <TableRow
                key={index}
                sx={{
                  bgcolor: index % 2 === 0 ? "#f9f9f9" : "white",
                  "&:hover": { backgroundColor: "#e0f7fa" },
                }}
              >
                <TableCell align="center">{feedback.userEmail}</TableCell>
                <TableCell align="center">
                  <Tooltip title={feedback.filename} arrow>
                    <span>{feedback.filename}</span>
                  </Tooltip>
                </TableCell>
                <TableCell align="center">{getFeedbackType(feedback.type)}</TableCell>
                <TableCell align="center">{feedback.feedback}</TableCell>
                <TableCell align="center">
                  {feedback.score > 0
                    ? "Positive"
                    : feedback.score < 0
                    ? "Negative"
                    : "Neutral"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FeedbackTable;