import React, { useContext }  from "react";
import { UserContext } from "../Context/UserContext";
import { Typography, Button, Container, Paper, CircularProgress } from "@mui/material";

const AdminPage = () => {
  const { userData, isLoggedIn } = useContext(UserContext);
   
  // Handle loading state
  if (!isLoggedIn || !userData) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading user data...
        </Typography>
      </Container>
    );
  }

  // Check if the user is not an QDP Agent  
  if (userData.role !== "Agent") {
    return (
      <Container maxWidth="sm" sx={{ mt: 10, textAlign: "center" }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" color="textSecondary">
            You do not have the required permissions to view this dashboard.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            href="/"
          >
            Go to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 5, textAlign: "center" }}>
    <Typography
      variant="h4"
      sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}
    >
      Admin Dashboard
    </Typography>
    <Paper
      elevation={4}
      sx={{ p: 2, backgroundColor: "#f9f9f9", borderRadius: 2 }}
    >
      <iframe
        title="Looker Studio Report"
        width="100%"
        height="600"
        src="https://lookerstudio.google.com/embed/reporting/21b87354-584b-4f56-a695-e13595b025d3/page/aczWE"
        style={{ borderRadius: "8px", border: "2px solid #ccc" }}
        allowFullScreen
        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      />
    </Paper>
  </Container>
  );
};

export default AdminPage;
