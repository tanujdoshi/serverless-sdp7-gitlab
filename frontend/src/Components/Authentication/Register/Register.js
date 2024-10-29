import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, Container, Typography } from "@mui/material";
import AWS from 'aws-sdk';

const cognito = new AWS.CognitoIdentityServiceProvider({
  region: 'us-east-1', 
  apiVersion: '2016-04-18',
});



function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityQuestion1, setSecurityQuestion1] = useState('');
  const [securityAnswer1, setSecurityAnswer1] = useState('');
  const [securityQuestion2, setSecurityQuestion2] = useState('');
  const [securityAnswer2, setSecurityAnswer2] = useState('');

const handleSubmit = (e) => {
  e.preventDefault();
  signUpUser(email, password);
};

const signUpUser = async (email, password) => {
  console.log(email, password); 
  const params = {
    ClientId: process.env.COGNITO_CLIENT_ID,
    Username: email,
    Password: password,
  };

  try {
    console.log("Signing up user");
    const result = await cognito.signUp(params).promise();
    console.log(result);
    const params1 = {
      TableName: 'UserSecurityQuestions',
      Item: {
        userId: email,
        question1: securityQuestion1,
        answer1: securityAnswer1,
        question2: securityQuestion2,
        answer2: securityAnswer2,
      },
    };

    try{
      console.log("Saving security questions");
      const uploadResponse = await axios.post('https://fsywgygjrg.execute-api.us-east-1.amazonaws.com/dev/signup', {
        userId: email,
        question1: securityQuestion1,
        answer1: securityAnswer1,
        question2: securityQuestion2,
        answer2: securityAnswer2,
      });
      console.log(uploadResponse);
    }catch(err){
      console.error("Error in saving security questions",err);
    }
  } catch (error) {
    console.log("Error in signUpUser", error);
    console.error(error);
  }
};

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Sign Up
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="Name" fullWidth margin="normal" required />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        <TextField
          label="Security Question 1"
          value={securityQuestion1}
          onChange={(e) => setSecurityQuestion1(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Security Answer 1"
          value={securityAnswer1}
          onChange={(e) => setSecurityAnswer1(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Security Question 2"
          value={securityQuestion2}
          onChange={(e) => setSecurityQuestion2(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Security Answer 2"
          value={securityAnswer2}
          onChange={(e) => setSecurityAnswer2(e.target.value)}
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
