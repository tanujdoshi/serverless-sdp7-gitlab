import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Grid,
} from "@mui/material";
import { UserContext } from "../Context/UserContext";

const Home = () => {
  const { userData } = useContext(UserContext);
  const email = localStorage.getItem("userEmail");
  const navigate = useNavigate();

  const handleChatClick = () => {
    console.log("Clickedd", userData);
    if (userData.role == "Agent") {
      navigate("/agent");
    } else {
      navigate("/client");
    }
  };

  return (
    <Box
      sx={{
        p: 4,
        maxWidth: 800,
        mx: "auto",
        mt: 6,
        backgroundColor: "#f9f9f9",
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      {/* Welcome Section */}
      <Typography
        variant="h4"
        sx={{
          textAlign: "center",
          mb: 2,
          fontWeight: "bold",
          color: "#1976d2",
        }}
      >
        Welcome to SDP-Group #7
      </Typography>

      <Card
        sx={{
          backgroundColor: "#ffffff",
          borderRadius: 2,
          boxShadow: 1,
          mb: 4,
        }}
      >
        <CardContent>
          {userData ? (
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Avatar
                  alt={userData.name}
                  src={userData.avatarUrl || ""}
                  sx={{
                    width: 56,
                    height: 56,
                    backgroundColor: "#1976d2",
                    fontSize: 24,
                  }}
                >
                  {userData.name.charAt(0).toUpperCase()}
                </Avatar>
              </Grid>
              <Grid item>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Welcome, {userData.name}!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Email: {email || "Not provided"}
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body1" sx={{ textAlign: "center" }}>
              Please log in to access your account.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Chat Button */}
      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Button
          variant="contained"
          size="large"
          sx={{
            textTransform: "none",
            backgroundColor: "#4caf50",
            ":hover": { backgroundColor: "#388e3c" },
          }}
          onClick={handleChatClick}
          disabled={!userData} // Disable if user is not logged in
        >
          Chat with Agent
        </Button>
        {!userData && (
          <Typography
            variant="caption"
            color="error"
            sx={{ display: "block", mt: 1 }}
          >
            Please log in to chat with an agent.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Home;
