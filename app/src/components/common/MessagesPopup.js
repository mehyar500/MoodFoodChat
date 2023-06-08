import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';

const MessagesPopup = ({ messages, theme, handleFindMoodClick, handleCloseDialog }) => {
    const [selectedInputIndex, setSelectedInputIndex] = useState(0);

    return (
        <Box
        component="div"
        sx={{
          height: '70vh',
          overflowY: 'scroll',
          mt: 2,
          px: 2,
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: theme.palette.divider,
          borderRadius: 1,
          backgroundColor: theme.palette.background.paper,
          margin: 1,
          '&::-webkit-scrollbar': {
            width: 8,
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 999,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            },
          },
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              my: 1,
              p: 1,
              backgroundColor: index === selectedInputIndex ? theme.palette.primary.main : theme.palette.primary.secondary,
              borderRadius: 1,
              cursor: 'pointer',
              color: index === selectedInputIndex ? 'white' : theme.palette.primary.main,
              transition: 'background-color 0.2s ease-in-out', // Add a transition effect
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)', // Change the background color on hover
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)', // Add a shadow effect on hover
                color: index === selectedInputIndex ? theme.palette.primary.main : theme.palette.primary.secondary,
              },
            }}
            onClick={() => {
              setSelectedInputIndex(index);
              handleFindMoodClick(messages[index]);
              handleCloseDialog();
            }}
          >
            <Typography variant="body1" sx={{ mt: 1, fontFamily: theme.typography.fontFamily }}>
              {message}
            </Typography>
          </Box>
        ))}
      </Box>
  );
};

export default MessagesPopup;
