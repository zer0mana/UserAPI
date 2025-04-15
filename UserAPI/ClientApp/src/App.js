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
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">TaskTracker</Link>
      </div>
      <div className="nav-links">
        {isAuthenticated ? (
          <>
            <Link to="/" className="nav-link">Мои списки</Link>
            <Link to="/recommended" className="nav-link">Рекомендации</Link>
            <span className="user-info">
              {user.firstName ? `${user.firstName} ${user.lastName}` : user.email}
            </span>
            <button onClick={handleLogout} className="logout-button">
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Войти</Link>
            <Link to="/register">Регистрация</Link>
          </>
        )}
      </div>
    </nav>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Система управления задачами
            </Typography>
            <Box>
              <Button color="inherit" component={Link} to="/">
                Списки задач
              </Button>
              <Button color="inherit" component={Link} to="/create-task-list">
                Создать список
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <div className="App">
          <Navigation />
          <Header />
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
      </Router>
    </ThemeProvider>
  );
}

export default App; 