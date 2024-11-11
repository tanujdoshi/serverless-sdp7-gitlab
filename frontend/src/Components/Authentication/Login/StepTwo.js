// src/components/StepTwo.js
import React from "react";
import { TextField, Typography } from "@mui/material";

const StepTwo = ({ formData, handleChange, errors }) => {
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
        error={!!errors.securityAnswerWritten}
        helperText={errors.securityAnswerWritten}
      />
    </>
  );
};

export default StepTwo;
