// src/components/StepTwo.js
import React from "react";
import { TextField, MenuItem } from "@mui/material";

const StepTwo = ({ formData, handleChange, errors }) => {
  const questions = [
    "What is your mother's maiden name?",
    "What is your favorite childhood pet?",
    "What is the name of your first school?",
    "What is your favorite sports team?",
    "What is your favorite movie?",
  ];

  return (
    <>
      <TextField
        label="Security Question"
        name="securityQuestion1"
        select
        value={formData.securityQuestion1}
        onChange={handleChange}
        fullWidth
        margin="normal"
        error={!!errors.securityQuestion1}
        helperText={errors.securityQuestion1}
      >
        {questions.map((question, index) => (
          <MenuItem key={index} value={question}>
            {question}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Security Answer"
        name="securityAnswer1"
        value={formData.securityAnswer1}
        onChange={handleChange}
        fullWidth
        margin="normal"
        error={!!errors.securityAnswer1}
        helperText={errors.securityAnswer1}
      />
    </>
  );
};

export default StepTwo;
