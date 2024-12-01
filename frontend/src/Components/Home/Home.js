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

  const handleOptionClick = (link) => {
    console.log("Clickedd", userData);
    navigate(link);
  };

  return (
    <Box
      sx={{
        p: 4,
        maxWidth: 900,
        mx: "auto",
        mt: 6,
        backgroundColor: "#f3f4f6",
        borderRadius: 3,
        boxShadow: 4,
      }}
    >
      {/* Welcome Section */}
      <Typography
        variant="h4"
        sx={{
          textAlign: "center",
          mb: 3,
          fontWeight: "bold",
          color: "#1976d2",
        }}
      >
        Welcome to Data Processing Hub
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: "center",
          mb: 4,
          color: "#616161",
        }}
      >
        Simplify your data workflows with our powerful tools!
      </Typography>

      {/* User Card */}
      <Card
        sx={{
          backgroundColor: "#ffffff",
          borderRadius: 2,
          boxShadow: 2,
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
                    width: 60,
                    height: 60,
                    backgroundColor: "#1976d2",
                    fontSize: 26,
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

      {/* Options Section */}
      <Grid container spacing={4} justifyContent="center">
        {[
          {
            title: "JSON to CSV",
            description: "Convert JSON files into CSV format effortlessly.",
            link: "/json-to-csv",
          },
          {
            title: "Text Transform",
            description: "Transform your text data with advanced tools.",
            link: "/txt-transform",
          },
          {
            title: "Word Cloud",
            description: "Generate stunning word clouds from your text.",
            link: "/word-cloud",
          },
        ].map((option, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                p: 2,
                textAlign: "center",
                backgroundColor: "#ffffff",
                borderRadius: 2,
                boxShadow: 3,
                ":hover": { boxShadow: 5, transform: "scale(1.05)" },
                transition: "transform 0.3s ease-in-out",
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "#1976d2" }}
                >
                  {option.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {option.description}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    textTransform: "none",
                    backgroundColor: "#4caf50",
                    ":hover": { backgroundColor: "#388e3c" },
                  }}
                  onClick={() => handleOptionClick(option.link)}
                >
                  Explore
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Chat Button */}
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          sx={{
            textTransform: "none",
            backgroundColor: "#1976d2",
            ":hover": { backgroundColor: "#1565c0" },
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
