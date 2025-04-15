import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import Header from './components/Header';
import TaskList from './components/TaskList';
import TaskDetail from './components/TaskDetail';
import CreateTask from './components/CreateTask';
import CreateTaskList from './components/CreateTaskList';
import Login from './components/Login';
import EditTaskList from './components/EditTaskList';
import EditTask from './components/EditTask';
import TaskLists from './components/TaskLists';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import authService from './services/authService';
import RecommendedTaskLists from './components/RecommendedTaskLists';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

const Navigation = () => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          TaskTracker
        </Typography>
        {isAuthenticated ? (
          <>
            <Button color="inherit" component={Link} to="/">
              Мои списки
            </Button>
            <Button color="inherit" component={Link} to="/create-task-list">
              Создать список
            </Button>
            <Button color="inherit" component={Link} to="/recommended">
              Рекомендации
            </Button>
            <Typography variant="body1" sx={{ mx: 2, color: 'white' }}>
              {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email}
            </Typography>
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleLogout}
              sx={{ 
                ml: 2,
                backgroundColor: '#d32f2f',
                '&:hover': {
                  backgroundColor: '#b71c1c'
                }
              }}
            >
              Выйти
            </Button>
          </>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/login">
              Войти
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Регистрация
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navigation />
          <div className="App">
            <div className="container">
              <Routes>
                <Route path="/" element={<TaskLists />} />
                <Route path="/create-task-list" element={<CreateTaskList />} />
                <Route path="/task-list/:id" element={<TaskList />} />
                <Route path="/edit-task-list/:id" element={<EditTaskList />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/edit-task/:id" element={
                  <ProtectedRoute>
                    <EditTask />
                  </ProtectedRoute>
                } />
                <Route path="/create-task" element={
                  <ProtectedRoute>
                    <CreateTask />
                  </ProtectedRoute>
                } />
                <Route path="/" element={<PrivateRoute><TaskLists /></PrivateRoute>} />
                <Route path="/recommended" element={<PrivateRoute><RecommendedTaskLists /></PrivateRoute>} />
              </Routes>
            </div>
          </div>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App; 