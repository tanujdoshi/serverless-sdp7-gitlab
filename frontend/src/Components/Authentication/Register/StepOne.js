import React from "react";
import { TextField, MenuItem } from "@mui/material";

const StepOne = ({ formData, handleChange }) => (
  <>
    <TextField
      label="Name"
      name="name"
      value={formData.name}
      onChange={handleChange}
      fullWidth
      margin="normal"
      required
    />
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
    <TextField
      label="Role"
      name="role"
      select
      value={formData.role}
      onChange={handleChange}
      fullWidth
      margin="normal"
      required
    >
      <MenuItem value="User">User</MenuItem>
      <MenuItem value="Agent">QDP Agent</MenuItem>
      <MenuItem value="Admin">Admin</MenuItem>
    </TextField>
  </>
);

export default StepOne;
