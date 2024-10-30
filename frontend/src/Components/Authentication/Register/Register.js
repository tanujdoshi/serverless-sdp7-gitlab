import React, { useState } from "react";
import axios from "axios";
import {
  Grid,
  Button,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from "@mui/material";
import AWS from "aws-sdk";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";

const cognito = new AWS.CognitoIdentityServiceProvider({
  region: "us-east-1",
  apiVersion: "2016-04-18",
});

function SignUp() {
  const steps = ["Personal Details", "Security Quesiton", "Math"];

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    securityQuestion1: "",
    securityAnswer1: "",
    captchaAnswer: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prevStep) => prevStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 3) {
      console.log("Form submitted:", formData);

      const params = {
        ClientId: "1748924r31pesr34u1sm5nb0bj",
        Username: formData.email,
        Password: formData.password,
      };

      await cognito.signUp(params).promise();

      console.log("User signed up");
      // Call backend API to verify the user
      const verifyRes = await axios.post("https://fsywgygjrg.execute-api.us-east-1.amazonaws.com/dev/signup/verify", {
        email: formData.email
      });

      // TDO - need to add name, and role of user to DB
      const uploadResponse = await axios.post(
        "https://fsywgygjrg.execute-api.us-east-1.amazonaws.com/dev/signup",
        {
          userId: formData.email,
          question1: formData.securityQuestion1,
          answer1: formData.securityAnswer1,
          name: formData.name,
          role: formData.role,
        }
      );
      console.log(uploadResponse);
    } else {
      setStep((prevStep) => prevStep + 1);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <StepOne formData={formData} handleChange={handleChange} />;
      case 2:
        return <StepTwo formData={formData} handleChange={handleChange} />;
      case 3:
        return <StepThree formData={formData} handleChange={handleChange} />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="sm">
      <Stepper
        activeStep={step - 1}
        alternativeLabel
        sx={{ marginBottom: 4, marginTop: 4 }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {renderStepContent()}

            <Grid
              item
              xs={12}
              sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
            >
              {step > 1 && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleBack}
                >
                  Back
                </Button>
              )}
              <Button variant="contained" color="primary" type="submit">
                {step === steps.length ? "Sign Up" : "Next"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default SignUp;
