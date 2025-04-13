import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/login');
  };

  if (!userId) {
    return null;
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Тасктрекер
        </Typography>
        <Box>
          <Button color="inherit" component={RouterLink} to="/">
            Списки задач
          </Button>
          <Button color="inherit" component={RouterLink} to="/create-task-list">
            Создать список
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            Выйти
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 