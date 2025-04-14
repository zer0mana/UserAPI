import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Button, 
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Checkbox
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { ru } from 'date-fns/locale';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const TaskList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);
  
  // Состояние для диалога создания/редактирования задачи
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: null
  });

  useEffect(() => {
    const fetchTaskList = async () => {
      try {
        const userDayNumber = localStorage.getItem('userId');
        if (!userDayNumber) {
          setError('Пользователь не авторизован');
          setLoading(false);
          return;
        }

        const response = await axios.get(`/pyd-user-api-handler/view-pyd/${id}?userDayNumber=${parseInt(userDayNumber, 10)}`);
        console.log('Ответ от сервера при загрузке списка задач:', response.data);
        setTitle(response.data.title);
        setDescription(response.data.description || '');
        setTasks(response.data.toDoTasks || []);
        setLoading(false);
      } catch (err) {
        console.error('Ошибка при загрузке списка задач:', err);
        setError('Не удалось загрузить список задач. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    };

    fetchTaskList();
  }, [id]);

  const handleOpenTaskDialog = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTaskForm({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate) : null
      });
    } else {
      setEditingTask(null);
      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: null
      });
    }
    setOpenTaskDialog(true);
  };

  const handleCloseTaskDialog = () => {
    setOpenTaskDialog(false);
    setEditingTask(null);
  };

  const handleTaskSubmit = async () => {
    try {
      const userDayNumber = localStorage.getItem('userId');
      if (!userDayNumber) {
        setError('Пользователь не авторизован');
        return;
      }

      console.log('Отправка данных задачи:', taskForm);

      if (editingTask) {
        // Обновление существующей задачи
        await axios.put(`/pyd-user-api-handler/update-task?pydId=${id}&taskId=${editingTask.id}`, taskForm);
      } else {
        // Создание новой задачи
        const createResponse = await axios.post(`/pyd-user-api-handler/create-task?pydId=${id}`, taskForm);
        console.log('Ответ при создании задачи:', createResponse.data);
      }

      // Обновляем список задач
      const response = await axios.get(`/pyd-user-api-handler/view-pyd/${id}?userDayNumber=${parseInt(userDayNumber, 10)}`);
      console.log('Ответ при обновлении списка задач:', response.data);
      setTasks(response.data.toDoTasks || []);
      
      handleCloseTaskDialog();
    } catch (err) {
      console.error('Ошибка при сохранении задачи:', err);
      setError('Не удалось сохранить задачу. Пожалуйста, попробуйте позже.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const userDayNumber = localStorage.getItem('userId');
      if (!userDayNumber) {
        setError('Пользователь не авторизован');
        return;
      }

      await axios.delete(`/pyd-user-api-handler/delete-task?pydId=${id}&taskId=${taskId}`);
      
      // Обновляем список задач
      const response = await axios.get(`/pyd-user-api-handler/view-pyd/${id}?userDayNumber=${parseInt(userDayNumber, 10)}`);
      setTasks(response.data.toDoTasks || []);
    } catch (err) {
      console.error('Ошибка при удалении задачи:', err);
      setError('Не удалось удалить задачу. Пожалуйста, попробуйте позже.');
    }
  };

  const handleTaskCompletion = async (taskId, completed) => {
    try {
      const userDayNumber = localStorage.getItem('userId');
      if (!userDayNumber) {
        setError('Пользователь не авторизован');
        return;
      }

      await axios.post(`/pyd-user-api-handler/mark-pyd-task-completed?pydId=${id}&taskId=${taskId}`);

      // Обновляем список задач
      const response = await axios.get(`/pyd-user-api-handler/view-pyd/${id}?userDayNumber=${parseInt(userDayNumber, 10)}`);
      setTasks(response.data.toDoTasks || []);
    } catch (err) {
      console.error('Ошибка при обновлении статуса задачи:', err);
      setError('Не удалось обновить статус задачи. Пожалуйста, попробуйте позже.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h1">
            {title}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate(`/edit-task-list/${id}`)}
          >
            Редактировать список
          </Button>
        </Box>
        
        {description && (
          <Typography variant="body1" color="text.secondary" paragraph>
            {description}
          </Typography>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Задачи
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenTaskDialog()}
          >
            Добавить задачу
          </Button>
        </Box>

        <List>
          {tasks.length === 0 ? (
            <ListItem>
              <ListItemText primary="Нет задач" />
            </ListItem>
          ) : (
            tasks.map((task, index) => (
              <React.Fragment key={task.id}>
                <ListItem>
                  <Checkbox
                    edge="start"
                    checked={task.completed}
                    onChange={(e) => handleTaskCompletion(task.id, e.target.checked)}
                  />
                  <ListItemText
                    primary={task.title}
                    secondary={
                      <>
                        {task.description && <Typography variant="body2">{task.description}</Typography>}
                        <Typography variant="caption" color="text.secondary">
                          Приоритет: {task.priority}
                          {task.dueDate && ` • Срок: ${new Date(task.dueDate).toLocaleDateString()}`}
                        </Typography>
                      </>
                    }
                    sx={{
                      textDecoration: task.completed ? 'line-through' : 'none',
                      color: task.completed ? 'text.secondary' : 'text.primary'
                    }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleOpenTaskDialog(task)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" onClick={() => handleDeleteTask(task.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < tasks.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>

      {/* Диалог создания/редактирования задачи */}
      <Dialog open={openTaskDialog} onClose={handleCloseTaskDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTask ? 'Редактирование задачи' : 'Создание задачи'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Название"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            required
            margin="normal"
          />

          <TextField
            fullWidth
            label="Описание"
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            multiline
            rows={4}
            margin="normal"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Приоритет</InputLabel>
            <Select
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              label="Приоритет"
            >
              <MenuItem value="low">Низкий</MenuItem>
              <MenuItem value="medium">Средний</MenuItem>
              <MenuItem value="high">Высокий</MenuItem>
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
            <DatePicker
              label="Срок выполнения"
              value={taskForm.dueDate}
              onChange={(newValue) => setTaskForm({ ...taskForm, dueDate: newValue })}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTaskDialog}>Отмена</Button>
          <Button onClick={handleTaskSubmit} variant="contained" color="primary">
            {editingTask ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskList; 