import React from "react";
import { TextField, MenuItem } from "@mui/material";

const StepOne = ({ formData, handleChange }) => {
  return (
    <>
      <TextField
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
    </>
  );
};

export default StepOne;
