import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
} from '@mui/material';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [sessionId, setSessionId] = useState('');
  const email = localStorage.getItem('userEmail');

  const cloudFunctionUrl = 'https://us-central1-serverless-441618.cloudfunctions.net/virtual-chat';

  useEffect(() => {
    setSessionId(uuidv4());
  }, []);

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = { text: userInput, sender: 'User', avatar: '/user-icon.png' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const response = await axios.post(
        cloudFunctionUrl,
        { message: userInput, email: email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      let botMessageText;
      if (typeof response.data.reply === 'object') {
        const replyObject = response.data.reply;
        botMessageText = `
          Filename: ${replyObject.filename}
          Process ID: ${replyObject.process_id}
          Status: ${replyObject.status}
          Output Link: ${replyObject.output_downloadable_link}
        `;
      } else {
        botMessageText = response.data.reply;
      }

      const botMessage = { text: botMessageText, sender: 'Bot', avatar: '/bot-icon.png' };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error communicating with the backend:', error);
      const errorMessage = { text: 'Error connecting to the backend.', sender: 'Bot', avatar: '/bot-icon.png' };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }

    setUserInput('');
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      alignItems="center"
      height="90vh"
      maxWidth="600px"
      mx="auto"
      my={2}
      borderRadius={12}
      bgcolor="#ffffff"
      boxShadow="0 4px 15px rgba(0, 0, 0, 0.2)" 
      border="1px solid #e0e0e0" 
    >
  
      <Box
        width="100%"
        py={2}
        px={2}
        bgcolor="#f9f9f9" 
        borderRadius="12px 12px 0 0"
        borderBottom="1px solid #e0e0e0" 
        boxShadow="0 1px 3px rgba(0,0,0,0.1)"
      >
        <Typography variant="h6" color="primary" align="center">
          Virtual Assistant
        </Typography>
      </Box>

      <Box
        flex={1}
        width="100%"
        overflow="auto"
        px={3}
        py={2}
        display="flex"
        flexDirection="column"
        gap={2}
        bgcolor="#ffffff"
      >
        {messages.length === 0 ? (
          <Box textAlign="center" color="#9e9e9e" mt={4}>
            <Typography variant="body1">Start chatting with our virtual assistant!</Typography>
          </Box>
        ) : (
          <List style={{ padding: 0 }}>
            {messages.map((message, index) => (
              <ListItem
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: message.sender === 'User' ? 'flex-end' : 'flex-start',
                  padding: '8px 0',
                }}
              >
                {message.sender === 'Bot' && (
                  <Box display="flex" alignItems="flex-start">
                    <Avatar
                      src={message.avatar}
                      alt=""
                      style={{ marginRight: '10px', width: '40px', height: '40px' }}
                    />
                    <Box
                      style={{
                        backgroundColor: '#f1f1f1',
                        padding: '10px 15px',
                        borderRadius: '15px 15px 15px 0',
                        maxWidth: '75%',
                        wordWrap: 'break-word',
                        border: '1px solid #e0e0e0',
                      }}
                    >
                      <Typography style={{ fontSize: '14px', color: '#333' }}>{message.text}</Typography>
                    </Box>
                  </Box>
                )}
                {message.sender === 'User' && (
                  <Box display="flex" alignItems="flex-start" flexDirection="row-reverse">
                    <Avatar
                      src={message.avatar}
                      alt=""
                      style={{ marginLeft: '10px', width: '40px', height: '40px' }}
                    />
                    <Box
                      style={{
                        backgroundColor: '#e6f7ff',
                        padding: '10px 15px',
                        borderRadius: '15px 15px 0 15px',
                        maxWidth: '75%',
                        wordWrap: 'break-word',
                        border: '1px solid #e0e0e0', 
                      }}
                    >
                      <Typography style={{ fontSize: '14px', color: '#333' }}>{message.text}</Typography>
                    </Box>
                  </Box>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      <Box
        width="100%"
        display="flex"
        alignItems="center"
        bgcolor="#f9f9f9" 
        borderTop="1px solid #e0e0e0"
        p={2}
        borderRadius="0 0 12px 12px"
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Write your message..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          InputProps={{
            style: {
              borderRadius: '20px',
              padding: '5px 12px',
              fontSize: '14px',
            },
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={sendMessage}
          style={{
            marginLeft: '10px',
            borderRadius: '20px',
            padding: '0 16px',
            fontSize: '14px',
            minWidth: 'auto',
            height: '40px',
          }}
        >
          SEND
        </Button>
      </Box>
    </Box>
  );
};

export default Chat;
