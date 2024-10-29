import React, { useState } from "react";
import AWS from 'aws-sdk';
import { useNavigate } from "react-router-dom";
import { Container, Typography, TextField, Button, Alert } from "@mui/material";


function Login() {
  const navigate = useNavigate();
  const [email,setEmail] = useState('');
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [password,setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSecurityQuestions, setShowSecurityQuestions] = useState(false);
  const [securityQuestion1, setSecurityQuestion1] = useState('');
  const [securityAnswer1, setSecurityAnswer1] = useState('');
  const [securityQuestion2, setSecurityQuestion2] = useState('');
  const [securityAnswer2, setSecurityAnswer2] = useState('');
  const cognito = new AWS.CognitoIdentityServiceProvider({
    region: 'us-east-1', 
    apiVersion: '2016-04-18',
  });

  const handleSubmit = async(e) =>{
    e.preventDefault();
    console.log(email, password);

    const params = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: '1748924r31pesr34u1sm5nb0bj',  
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      }
    };


    try{
      const res = await cognito.initiateAuth(params).promise();
      if(res.AuthenticationResult){
        // const 
        setShowSecurityQuestions(true);
        localStorage.setItem('accessToken',res.AuthenticationResult.AccessToken);
        localStorage.setItem('refreshToken',res.AuthenticationResult.RefreshToken);
      }
      return res;
    }catch(err){
      console.error("Sign in err",err);
      if(err.code === 'NotAuthorizedException'){
        setErrorMessage("Wrong username or password");
      }
    }
  }
  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
        />
        <Button variant="contained" color="primary" type="submit" fullWidth>
          Login
        </Button>

        {errorMessage && (
        <Alert severity="error" style={{ marginBottom: '10px' }}>
          {errorMessage}
        </Alert>
      )}
      </form>

        {showSecurityQuestions && (
         <form>
          <TextField
            label="Security Question 1"
            value={securityQuestion1}
            onChange={(e)=> setSecurityQuestion1(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Security Answer 1"
            value={securityAnswer1}
            onChange={(e)=> setSecurityAnswer1(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Security Question 2"
            value={securityQuestion2}
            onChange={(e)=> setSecurityQuestion2(e.target.value)}
            fullWidth
            margin="normal"
            required
          />  
          <TextField
            label="Security Answer 2"
            value={securityAnswer2}
            onChange={(e)=> setSecurityAnswer2(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
         </form>
        )}
    </Container>
  );
}

export default Login;
