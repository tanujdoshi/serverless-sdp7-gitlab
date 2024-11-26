import React from "react";
import { TextField, MenuItem } from "@mui/material";
import { Field, ErrorMessage } from "formik";

const StepOne = ({ formData, handleChange, errors }) => {
  return (
    <>
      <TextField
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        fullWidth
        margin="normal"
        error={!!errors.name}
        helperText={errors.name}
      />

      <TextField
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        fullWidth
        margin="normal"
        error={!!errors.email}
        helperText={errors.email}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        fullWidth
        margin="normal"
        error={!!errors.password}
        helperText={errors.password}
      />
      <TextField
        label="Role"
        name="role"
        select
        value={formData.role}
        onChange={handleChange}
        fullWidth
        margin="normal"
        error={!!errors.role}
        helperText={errors.role}
      >
        <MenuItem value="User">User</MenuItem>
        <MenuItem value="Agent">QDP Agent</MenuItem>
        <MenuItem value="Admin">Admin</MenuItem>
      </TextField>
    </>
  );
};

export default StepOne;
