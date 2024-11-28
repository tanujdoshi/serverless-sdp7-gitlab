import React, { useState, useEffect } from "react";
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
  Chip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {
  getUploadedFileUrl,
  getDataProcessInfo,
  txtProcess,
} from "../../api/apiService";

const TxtTransform = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [txtProcessData, setTxtProcessData] = useState({});

  const getStatusLabel = (status) => {
    switch (status) {
      case "Completed":
        return <Chip label="Completed" color="success" />;
      case "in_progress":
        return <Chip label="In Progress" color="warning" />;
      case "Failed":
        return <Chip label="Failed" color="error" />;
      default:
        return <Chip label="Unknown" />;
    }
  };

  function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const formattedDate = date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    });
    return formattedDate;
  }

  const fetchTxtProcess = async () => {
    const res = await getDataProcessInfo(
      localStorage.getItem("userEmail"),
      "txt"
    );
    setTxtProcessData(res.data);
  };
  useEffect(() => {
    fetchTxtProcess();
  }, []);

  // Handle file selection
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      console.log("Please select a TXT file to upload");
      return;
    }

    setUploading(true);

    try {
      const url = await getUploadedFileUrl(file, "txt");
      // const url = "s3://sdp7-source-bucket/input/test.txt";
      // const body = {
      //   user_email: localStorage.getItem("userEmail"),
      //   s3_location: url,
      // };
      // await txtProcess(body);
    } catch (error) {
      console.log("Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 2, textAlign: "center" }}>
        <Typography variant="h4">TXT Entity Extractor to CSV</Typography>
        <Typography variant="subtitle1">
          Upload TXT files to extract entities and save results as CSV
        </Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
        <input
          accept="text/plain"
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

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          File Processing Status
        </Typography>
        <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Reference #</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>File Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Output</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {txtProcessData.length > 0 ? (
                txtProcessData.map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{row.process_id}</TableCell>
                    <TableCell>{row.filename}</TableCell>
                    <TableCell>{getStatusLabel(row.status)}</TableCell>
                    <TableCell>
                      {row.output_downloadable_link ? (
                        <a
                          href={row.output_downloadable_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            textDecoration: "none",
                            color: "#1a73e8",
                            fontWeight: "bold",
                          }}
                        >
                          {row.filename?.replace(".txt", ".csv")}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>{formatDate(row.timestamp)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default TxtTransform;
