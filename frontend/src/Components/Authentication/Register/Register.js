import React from "react";
import { TextField, Button, Container, Typography } from "@mui/material";

function SignUp() {
  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Sign Up
      </Typography>
      <form>
        <TextField label="Name" fullWidth margin="normal" required />
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          margin="normal"
          required
        />
        <Button variant="contained" color="primary" type="submit" fullWidth>
          Sign Up
        </Button>
      </form>
    </Container>
  );
}

export default SignUp;
