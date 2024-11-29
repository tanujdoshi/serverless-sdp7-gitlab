import React from "react";

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
          <ErrorOutlineIcon color="error" sx={{ fontSize: 50 }} />
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
    <h1>Admin Dashboard</h1>
  );
};

export default AdminPage;
