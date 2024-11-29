import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";

const ConcernsTab = ({
  loading,
  assignedConcerns,
  raisedConcerns,
  handleConcernClick,
}) => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  const renderList = (concerns, noDataMessage) => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (concerns.length === 0) {
      return (
        <Typography variant="body1" color="textSecondary" sx={{ py: 2 }}>
          {noDataMessage}
        </Typography>
      );
    }

    return (
      <List>
        {concerns.map((concern) => (
          <ListItem
            key={concern.id}
            button
            onClick={() => handleConcernClick(concern)}
            sx={{
              mb: 1,
              border: "1px solid #ddd",
              borderRadius: 1,
              p: 1.5,
              "&:hover": {
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            <ListItemText
              primary={concern.concernText}
              secondary={`Reference ID: ${concern.referenceId}`}
            />
          </ListItem>
        ))}
      </List>
    );
  };

  return (
    <Card>
      <CardHeader title="Concerns" />
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
        sx={{ borderBottom: "1px solid #ddd" }}
      >
        <Tab label="Assigned Concerns" />
        <Tab label="Raised Concerns" />
      </Tabs>
      <CardContent>
        {tabIndex === 0 &&
          renderList(assignedConcerns, "No concerns assigned to you.")}
        {tabIndex === 1 &&
          renderList(raisedConcerns, "No concerns raised by you.")}
      </CardContent>
    </Card>
  );
};

export default ConcernsTab;
