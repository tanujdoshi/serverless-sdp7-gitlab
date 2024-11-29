import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Button,
  InputLabel,
  Typography,
  Box,
} from "@mui/material";
import { FeedbackOutlined } from "@mui/icons-material";

const RaiseConcernCard = ({
  dataProcess,
  referenceId,
  concernText,
  handleChange,
  setConcernText,
  createConcern,
}) => {
  return (
    <Card
      sx={{
        mb: 3,
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        borderRadius: 2,
      }}
    >
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <FeedbackOutlined sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" color="textPrimary">
              Raise a Concern
            </Typography>
          </Box>
        }
        sx={{ borderBottom: "1px solid #ddd", pb: 1.5 }}
      />
      <CardContent>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <Select
            labelId="reference-id-label"
            value={referenceId}
            onChange={handleChange}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Select a process ID or file
            </MenuItem>
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
        <TextField
          label="Describe Your Concern"
          value={concernText}
          onChange={(e) => setConcernText(e.target.value)}
          fullWidth
          multiline
          rows={4}
          placeholder="Provide details about your concern..."
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#ccc",
              },
              "&:hover fieldset": {
                borderColor: "primary.main",
              },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={createConcern}
          fullWidth
          sx={{
            py: 1.2,
            fontWeight: "bold",
            fontSize: "1rem",
            textTransform: "none",
            boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.2)",
          }}
        >
          Raise Concern
        </Button>
      </CardContent>
    </Card>
  );
};

export default RaiseConcernCard;
