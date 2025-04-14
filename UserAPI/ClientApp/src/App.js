import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
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

function App() {
  const userId = localStorage.getItem('userId');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Система управления задачами
            </Typography>
            {userId ? (
              <Box>
                <Button color="inherit" component={Link} to="/">
                  Списки задач
                </Button>
                <Button color="inherit" component={Link} to="/create-task-list">
                  Создать список
                </Button>
                <Button 
                  color="inherit" 
                  onClick={() => {
                    localStorage.removeItem('userId');
                    window.location.href = '/login';
                  }}
                >
                  Выйти
                </Button>
              </Box>
            ) : (
              <Button color="inherit" component={Link} to="/login">
                Войти
              </Button>
            )}
          </Toolbar>
        </AppBar>

        <div className="App">
          <Header />
          <div className="container">
            <Routes>
              <Route path="/" element={<TaskLists />} />
              <Route path="/create-task-list" element={<CreateTaskList />} />
              <Route path="/task/:id" element={<TaskList />} />
              <Route path="/edit-task-list/:id" element={<EditTaskList />} />
              <Route path="/login" element={<Login />} />
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App; 