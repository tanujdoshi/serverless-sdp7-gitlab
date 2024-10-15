import React from "react";
import { TextField, Button, Container, Typography } from "@mui/material";

function Login() {
  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <form>
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
        <Button variant="contained" color="primary" type="submit" fullWidth>
          Login
        </Button>
      </form>
    </Container>
  );
}

export default Login;
