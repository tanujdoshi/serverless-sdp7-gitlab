import React, { useState } from "react";
import AWS from "aws-sdk";
import { Container, Typography, TextField, Button, Alert } from "@mui/material";
function Confirmation() {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const cognito = new AWS.CognitoIdentityServiceProvider({
    region: "us-east-1",
    apiVersion: "2016-04-18",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await cognito
        .confirmSignUp({
          ClientId: process.env.COGNITO_CLIENT_ID,
          Username: email,
          ConfirmationCode: verificationCode,
        })
        .promise();
    } catch (error) {
      console.error("Error confirming user", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        fullWidth
        label="Verification Code"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
        required
      />
      <Button type="submit" variant="contained" color="primary">
        Confirm
      </Button>
      <button type="submit">Confirm</button>
    </form>
  );
}

export default Confirmation;
