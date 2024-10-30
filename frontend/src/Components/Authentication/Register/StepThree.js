// src/components/StepThree.js
import React from "react";
import { TextField, Typography } from "@mui/material";

const StepThree = ({ formData, handleChange }) => (
  <>
    <Typography variant="body1" gutterBottom>
      What is 5 + 3?
    </Typography>
    <TextField
      label="Answer"
      name="captchaAnswer"
      value={formData.captchaAnswer}
      onChange={handleChange}
      fullWidth
      margin="normal"
      required
    />
  </>
);

export default StepThree;
