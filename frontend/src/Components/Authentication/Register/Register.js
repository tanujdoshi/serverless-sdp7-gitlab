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
import { useNavigate } from "react-router-dom";

const cognito = new AWS.CognitoIdentityServiceProvider({
  region: "us-east-1",
  apiVersion: "2016-04-18",
});

function SignUp() {
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});

  const steps = ["Personal Details", "Security Quesiton", "Math"];

  const [step, setStep] = useState(1);

  const validate = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.name) newErrors.name = "Name is required";
      if (!formData.email) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email))
        newErrors.email = "Email is invalid";
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";
      if (!formData.role) newErrors.role = "Role is required";
    }
    if (step === 2) {
      if (!formData.securityQuestion1)
        newErrors.securityQuestion1 = "Security Question is required";
      if (!formData.securityAnswer1)
        newErrors.securityAnswer1 = "Security Answer is required";
    }
    if (step === 3) {
      if (!formData.captchaAnswer)
        newErrors.captchaAnswer = "Answer is required";
    }
    return newErrors;
  };

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

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    } else {
      setErrors({});
    }

    if (step === 3) {
      // First check if math skill is correct or not
      const body = {
        user_id: formData.userIdCaptcha,
        submitted_answer: formData.captchaAnswer,
      };
      const response = await axios.post(
        "https://0u3r8l69m5.execute-api.us-east-1.amazonaws.com/dev1/ValidateAnswer",
        body
      );

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

        await axios.post(
          "https://5q5nra43v3.execute-api.us-east-1.amazonaws.com/dev/registration-notification",
          {
            userEmail: formData.email,
          }
        );

        navigate("/login");
      } catch (err) {
        if (err.code === "UsernameExistsException") {
          toast.error(
            "Username already exists. Please choose a different username."
          );
        } else {
          toast.error("Something went wrong. Please try again");
        }
      }
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
        return (
          <StepTwo
            formData={formData}
            handleChange={handleChange}
            errors={errors}
          />
        );
      case 3:
        return (
          <StepThree
            formData={formData}
            handleChange={handleChange}
            errors={errors}
          />
        );
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
