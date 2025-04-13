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
    const fetchTaskList = async () => {
      try {
        // Здесь будет реальный userDayNumber, в данном примере используем 1
        const userDayNumber = 1;
        const response = await axios.get(`/pyd-user-api-handler/view-pyd/${id}?userDayNumber=${userDayNumber}`);
        setTaskList(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Ошибка при загрузке списка задач:', err);
        setError('Не удалось загрузить список задач. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    };

    fetchTaskList();
  }, [id]);

  const handleTaskCompletion = async (taskId) => {
    try {
      await axios.post(`/pyd-user-api-handler/mark-pyd-task-completed?pydId=${id}&taskId=${taskId}`);
      // Обновляем состояние после успешного выполнения
      setTaskList(prevList => ({
        ...prevList,
        tasks: prevList.tasks.map(task => 
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      }));
    } catch (err) {
      console.error('Ошибка при обновлении статуса задачи:', err);
      // Здесь можно добавить уведомление пользователя об ошибке
    }
  };

  const handleDeleteTask = (taskId) => {
    // Здесь будет логика удаления задачи
    console.log('Удалить задачу', taskId);
  };

  const handleEditTask = (taskId) => {
    // Здесь будет логика редактирования задачи
    console.log('Редактировать задачу', taskId);
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {taskList.title}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => navigate(`/create-task?listId=${id}`)}
        >
          Добавить задачу
        </Button>
      </Box>

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

      {taskList.tasks && taskList.tasks.length > 0 ? (
        <List>
          {taskList.tasks.map((task, index) => (
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
              {index < taskList.tasks.length - 1 && <Divider />}
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