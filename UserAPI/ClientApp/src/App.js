import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/Header';
import TaskList from './components/TaskList';
import TaskDetail from './components/TaskDetail';
import CreateTask from './components/CreateTask';
import CreateTaskList from './components/CreateTaskList';
import Login from './components/Login';
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

// Компонент для защиты маршрутов
const ProtectedRoute = ({ children }) => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Header />
          <div className="container">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <TaskList />
                </ProtectedRoute>
              } />
              <Route path="/task/:id" element={
                <ProtectedRoute>
                  <TaskDetail />
                </ProtectedRoute>
              } />
              <Route path="/create-task" element={
                <ProtectedRoute>
                  <CreateTask />
                </ProtectedRoute>
              } />
              <Route path="/create-task-list" element={
                <ProtectedRoute>
                  <CreateTaskList />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App; 