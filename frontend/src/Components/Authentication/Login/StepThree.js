import axios from "axios";
import React, { useState, useEffect } from "react";
import { TextField, Typography } from "@mui/material";

const StepThree = ({ formData, handleChange, errors }) => {
  const [question, setQuestion] = useState("");

  useEffect(() => {
    const fetchMath = async () => {
      try {
        const response = await axios.get(
          "https://hs2gpyfk8g.execute-api.us-east-1.amazonaws.com/dev?user_id=" +
            formData.userIdCaptcha
        );
        const body = JSON.parse(response.data.body);
        setQuestion(body.question);
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      }
    };
    fetchMath();
  }, []);
  return (
    <>
      <Typography variant="h6" margin="normal">
        {question || "Loading question..."}
      </Typography>
      <TextField
        label="Your Answer"
        name="captchaAnswer"
        value={formData.captchaAnswer}
        onChange={handleChange}
        fullWidth
        margin="normal"
        error={!!errors.captchaAnswer}
        helperText={errors.captchaAnswer}
      />
    </>
  );
};

export default StepThree;
