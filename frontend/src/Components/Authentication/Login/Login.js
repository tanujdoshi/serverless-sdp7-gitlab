import React, { useState, useContext, useEffect } from "react";
import AWS from "aws-sdk";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Container,
  Paper,
  Stepper,
  Button,
  Grid,
  Step,
  StepLabel,
} from "@mui/material";
import axios from "axios";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";

function Login() {
  const { loginUser } = useContext(UserContext);
  const navigate = useNavigate();

  const steps = ["Personal Details", "Security Question", "Math"];
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [token, setToken] = useState({});
  const [role, setRole] = useState(null); // State to track role
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    securityQuestion: "",
    securityAnswerExpected: "",
    securityAnswerWritten: "",
    userIdCaptcha: uuidv4().substring(0, 6),
    captchaAnswer: "",
  });

  const cognito = new AWS.CognitoIdentityServiceProvider({
    region: "us-east-1",
    apiVersion: "2016-04-18",
  });

  const validate = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.email) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email))
        newErrors.email = "Email is invalid";
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";
    }
    if (step === 2) {
      if (!formData.securityAnswerWritten)
        newErrors.securityAnswerWritten = "Security Answer is required";
    }
    if (step === 3) {
      if (!formData.captchaAnswer)
        newErrors.captchaAnswer = "Answer is required";
    }
    return newErrors;
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

    if (step === 1) {
      const params = {
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: "1748924r31pesr34u1sm5nb0bj",
        AuthParameters: {
          USERNAME: formData.email,
          PASSWORD: formData.password,
        },
      };
      try {
        const res = await cognito.initiateAuth(params).promise();
        if (res.AuthenticationResult) {
          const questionRes = await axios.post(
            "https://fsywgygjrg.execute-api.us-east-1.amazonaws.com/dev/login/getSecQuesAns",
            { email: formData.email }
          );
          const question1 = JSON.parse(questionRes.data.body).question1;
          const answer1 = JSON.parse(questionRes.data.body).answer1;
          formData.securityQuestion = question1;
          formData.securityAnswerExpected = answer1;

          setToken(res.AuthenticationResult);

          setStep((prevStep) => prevStep + 1);
        }
      } catch (err) {
        console.error("Sign in error:", err);
        if (err.code === "NotAuthorizedException") {
          toast.error("Incorrect email/password.");
        } else {
          toast.error("Something went wrong.");
        }
      }
    } else if (step === 2) {
      if (formData.securityAnswerExpected === formData.securityAnswerWritten) {
        setStep((prevStep) => prevStep + 1);
      } else {
        toast.error("Answer does not match.");
      }
    } else if (step === 3) {
      const body = {
        user_id: formData.userIdCaptcha,
        submitted_answer: formData.captchaAnswer,
      };

      const response = await axios.post(
        "https://0u3r8l69m5.execute-api.us-east-1.amazonaws.com/dev1/ValidateAnswer",
        body
      );
      if (response.data.statusCode !== 200) {
        toast.error("Incorrect answer. Please try again.");
        return;
      }

      await axios.post(
        "https://5q5nra43v3.execute-api.us-east-1.amazonaws.com/dev/login-notification",
        {
          userEmail: formData.email,
        }
      );

      loginUser(formData.email);
      console.log("role:", role);
      try {
        const userData = await axios.post(
          "https://fsywgygjrg.execute-api.us-east-1.amazonaws.com/dev/login/userDetails",
          { email: formData.email }
        );
        console.log("userData:", userData.data.body);
        console.log("role:", userData.data.body.role);
        const userDataBody = JSON.parse(userData.data.body);
        const fetchedRole = userDataBody.role;
        if(fetchedRole){
          const res = await axios.post(
            "https://us-central1-serverless-pro-442123.cloudfunctions.net/logindata",
            {
              email: formData.email,
              role:fetchedRole,
            }
          );
          console.log("aa:", res.data);
        }
        setRole(fetchedRole); // Set the role, triggers useEffect
      } catch (err) {
        console.error("Error fetching user details:", err);
        toast.error("Failed to fetch user details.");
      }
      console.log("role now", role);
      navigate("/");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  fullWidth
                >
                  {step === steps.length ? "Sign In" : "Next"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </>
  );
}

export default Login;
