// src/components/StepTwo.js
import React from "react";
import { TextField, Typography } from "@mui/material";

const StepTwo = ({ formData, handleChange }) => {
  return (
    <>
      <Typography variant="h6" margin="normal">
        {formData.securityQuestion || "Loading question..."}
      </Typography>
      <TextField
        label="Security Answer"
        name="securityAnswerWritten"
        value={formData.securityAnswerWritten}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
    </>
  );
};

export default StepTwo;
