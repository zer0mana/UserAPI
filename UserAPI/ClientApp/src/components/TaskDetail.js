import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction,
  Checkbox,
  IconButton,
  Divider,
  CircularProgress,
  Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [taskList, setTaskList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Получен id из URL:', id);
    const fetchTaskList = async () => {
      try {
        if (!id) {
          setError('ID списка задач не указан');
          setLoading(false);
          return;
        }

        const userDayNumber = localStorage.getItem('userId');
        if (!userDayNumber) {
          setError('Пользователь не авторизован');
          setLoading(false);
          return;
        }

        console.log('Загрузка списка задач с ID:', id);
        const response = await axios.get(`/pyd-user-api-handler/view-pyd/${id}?userDayNumber=${parseInt(userDayNumber, 10)}`);
        console.log('Ответ от сервера:', response.data);
        setTaskList(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Ошибка при загрузке списка задач:', err);
        if (err.response) {
          console.error('Детали ошибки:', {
            status: err.response.status,
            data: err.response.data,
            headers: err.response.headers,
            url: err.config?.url
          });
        }
        setError('Не удалось загрузить список задач. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    };

    fetchTaskList();
  }, [id]);

  const handleTaskCompletion = async (taskId) => {
    try {
      const userDayNumber = localStorage.getItem('userId');
      if (!userDayNumber) {
        console.error('Пользователь не авторизован');
        return;
      }
      await axios.post(`/pyd-user-api-handler/mark-pyd-task-completed?pydId=${id}&taskId=${taskId}&userDayNumber=${parseInt(userDayNumber, 10)}`);
      // Обновляем состояние после успешного выполнения
      setTaskList(prevList => ({
        ...prevList,
        toDoTasks: prevList.toDoTasks.map(task => 
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      }));
    } catch (err) {
      console.error('Ошибка при обновлении статуса задачи:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const userDayNumber = localStorage.getItem('userId');
      if (!userDayNumber) {
        console.error('Пользователь не авторизован');
        return;
      }
      await axios.delete(`/pyd-user-api-handler/delete-task?pydId=${id}&taskId=${taskId}&userDayNumber=${parseInt(userDayNumber, 10)}`);
      // Обновляем состояние после успешного удаления
      setTaskList(prevList => ({
        ...prevList,
        toDoTasks: prevList.toDoTasks.filter(task => task.id !== taskId)
      }));
    } catch (err) {
      console.error('Ошибка при удалении задачи:', err);
    }
  };

  const handleEditTask = (taskId) => {
    // Здесь будет логика редактирования задачи
    console.log('Редактировать задачу', taskId);
  };

  const handleDeleteTaskList = async () => {
    try {
      const userDayNumber = localStorage.getItem('userId');
      if (!userDayNumber) {
        console.error('Пользователь не авторизован');
        return;
      }
      await axios.delete(`/pyd-user-api-handler/delete-pyd?pydId=${id}&userDayNumber=${parseInt(userDayNumber, 10)}`);
      // Обновляем состояние после успешного удаления списка
      setTaskList(null);
      navigate('/');
    } catch (err) {
      console.error('Ошибка при удалении списка задач:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!taskList) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography>Список задач не найден</Typography>
      </Box>
    );
  }

  return (
    <div className="task-detail">
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h1">
            {taskList.title}
          </Typography>
          <Box>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => navigate(`/edit-task-list/${id}`)}
              sx={{ mr: 1 }}
            >
              Редактировать список
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={handleDeleteTaskList}
            >
              Удалить список
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="body1" paragraph>
          {taskList.description || 'Без описания'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Создан: {new Date(taskList.createdAt).toLocaleDateString()}
        </Typography>
      </Paper>

      <Typography variant="h6" component="h2" gutterBottom>
        Задачи
      </Typography>

      {taskList.toDoTasks && taskList.toDoTasks.length > 0 ? (
        <List>
          {taskList.toDoTasks.map((task, index) => (
            <React.Fragment key={task.id}>
              <ListItem>
                <Checkbox
                  edge="start"
                  checked={task.completed}
                  onChange={() => handleTaskCompletion(task.id)}
                  color="primary"
                />
                <ListItemText 
                  primary={task.title} 
                  secondary={task.description}
                  sx={{ 
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? 'text.secondary' : 'text.primary'
                  }}
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    aria-label="edit" 
                    onClick={() => handleEditTask(task.id)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    edge="end" 
                    aria-label="delete" 
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              {index < taskList.toDoTasks.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Typography variant="body1" align="center">
          В этом списке пока нет задач. Добавьте новую задачу, чтобы начать.
        </Typography>
      )}
    </div>
  );
};

export default TaskDetail; 