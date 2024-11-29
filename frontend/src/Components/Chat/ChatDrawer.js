import React from "react";
import {
  Card,
  CardHeader,
  Divider,
  CardContent,
  List,
  ListItem,
  Typography,
  TextField,
  Button,
  Drawer,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ChatDrawer = ({
  selectedConcern,
  messages,
  agentId,
  concernText,
  setConcernText,
  handleSendMessage,
  getMessanger,
  open,
  onClose,
}) => {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Card
        sx={{
          width: 400,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardHeader
          title={`Chat for Concern: ${selectedConcern?.concernText} with ${selectedConcern?.customerName}`}
          action={
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent
          sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
        >
          <List sx={{ maxHeight: 300, overflowY: "auto", mb: 2 }}>
            {messages.map((msg, index) => (
              <ListItem
                key={index}
                sx={{
                  justifyContent:
                    getMessanger(msg) === "You" ? "flex-end" : "flex-start",
                  p: 1,
                  display: "flex",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    backgroundColor:
                      msg.senderId === agentId ? "#e3f2fd" : "#f1f8e9",
                    p: 1,
                    borderRadius: 1,
                    display: "inline-block",
                    maxWidth: "75%",
                  }}
                >
                  <strong>{getMessanger(msg)}:</strong> {msg.text}
                </Typography>
              </ListItem>
            ))}
          </List>
          <TextField
            label="Your Message"
            value={concernText}
            onChange={(e) => setConcernText(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={handleSendMessage} fullWidth>
            Send Message
          </Button>
        </CardContent>
      </Card>
    </Drawer>
  );
};

export default ChatDrawer;
