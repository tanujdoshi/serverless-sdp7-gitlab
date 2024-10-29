import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const JsonToCsvProcessor = () => {
  const [file, setFile] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle file selection
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a JSON file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    setMessage("");

    try {
      const response = await axios.post("<YOUR_API_ENDPOINT>", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Mock response handling; ideally, this would come from the backend
      const newStatus = {
        fileName: file.name,
        status: "Processing",
        timestamp: new Date().toLocaleString(),
      };
      setStatusData((prevData) => [...prevData, newStatus]);
      setMessage("File uploaded successfully!");
    } catch (error) {
      setMessage("Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 2, textAlign: "center" }}>
        <Typography variant="h4">JSON to CSV Processor</Typography>
        <Typography variant="subtitle1">
          Upload JSON files to convert to CSV
        </Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
        <input
          accept="application/json"
          type="file"
          style={{ display: "none" }}
          id="upload-file"
          onChange={handleFileChange}
        />
        <label htmlFor="upload-file">
          <Button
            variant="contained"
            component="span"
            color="primary"
            startIcon={<CloudUploadIcon />}
            sx={{ mr: 2 }}
          >
            Choose File
          </Button>
        </label>
        <Button
          variant="contained"
          color="success"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? <CircularProgress size={24} /> : "Upload"}
        </Button>
      </Box>

      {message && (
        <Alert severity="info" sx={{ mb: 4, textAlign: "center" }}>
          {message}
        </Alert>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          File Processing Status
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>File Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statusData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.fileName}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default JsonToCsvProcessor;
