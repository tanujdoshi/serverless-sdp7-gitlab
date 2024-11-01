import React, { useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Grid,
  Button,
  Container,
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

  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    securityQuestion1: "",
    securityAnswer1: "",
    userIdCaptcha: uuidv4().substring(0, 6),
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

      // First check if math skill is correct or not
      const body = {
        user_id: formData.userIdCaptcha,
        submitted_answer: formData.captchaAnswer,
      };
      const response = await axios.post(
        "https://0u3r8l69m5.execute-api.us-east-1.amazonaws.com/dev1/ValidateAnswer",
        body
      );

      console.log("response", response);
      if (response.data.statusCode != 200) {
        toast.error("Incorrect answer. Please try again.");
        return;
      }

      try {
        const params = {
          ClientId: "1748924r31pesr34u1sm5nb0bj",
          Username: formData.email,
          Password: formData.password,
        };

        await cognito.signUp(params).promise();

        console.log("User signed up");
        // Call backend API to verify the user
        await axios.post(
          "https://fsywgygjrg.execute-api.us-east-1.amazonaws.com/dev/signup/verify",
          {
            email: formData.email,
          }
        );

        await axios.post(
          "https://fsywgygjrg.execute-api.us-east-1.amazonaws.com/dev/signup",
          {
            userId: formData.email,
            question1: formData.securityQuestion1,
            answer1: formData.securityAnswer1,
            name: formData.name,
            role: formData.role,
          }
        );
      } catch (err) {
        if (err.code === "UsernameExistsException") {
          toast.error(
            "Username already exists. Please choose a different username."
          );
        } else {
          toast.error("Something went wrong. Please try again");
        }
      }
      // console.log(uploadResponse);
    } else {
      setStep((prevStep) => prevStep + 1);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <StepOne
            formData={formData}
            handleChange={handleChange}
            errors={errors}
          />
        );
      case 2:
        return <StepTwo formData={formData} handleChange={handleChange} />;
      case 3:
        return <StepThree formData={formData} handleChange={handleChange} />;
      default:
        return null;
    }
  };

  return (
    <>
      <ToastContainer />
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
    </>
  );
}

export default SignUp;
