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
  Checkbox,
  Chip
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { ru } from 'date-fns/locale';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import taskService from '../services/taskService';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

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
    dueDate: null,
    points: 0
  });

  useEffect(() => {
    const fetchTaskList = async () => {
      try {
        const response = await taskService.getTaskList(id);
        console.log('Ответ от сервера при загрузке списка задач:', response);
        setTitle(response.title);
        setDescription(response.description || '');
        setTasks(response.toDoTasks || []);
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
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        points: task.points || 0
      });
    } else {
      setEditingTask(null);
      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: null,
        points: 0
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
      console.log('Отправка данных задачи:', taskForm);

      if (editingTask) {
        // Обновление существующей задачи
        await taskService.updateTask(
          id, 
          editingTask.id, 
          taskForm.title, 
          taskForm.description, 
          taskForm.completed,
          taskForm.priority, 
          taskForm.dueDate,
          taskForm.points
        );
      } else {
        // Создание новой задачи
        await taskService.createTask(
          id, 
          taskForm.title, 
          taskForm.description, 
          taskForm.priority, 
          taskForm.dueDate,
          taskForm.points
        );
      }

      // Обновляем список задач
      const response = await taskService.getTaskList(id);
      console.log('Ответ при обновлении списка задач:', response);
      setTasks(response.toDoTasks || []);
      
      handleCloseTaskDialog();
    } catch (err) {
      console.error('Ошибка при сохранении задачи:', err);
      setError('Не удалось сохранить задачу. Пожалуйста, попробуйте позже.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(id, taskId);
      
      // Обновляем список задач
      const response = await taskService.getTaskList(id);
      setTasks(response.toDoTasks || []);
    } catch (err) {
      console.error('Ошибка при удалении задачи:', err);
      setError('Не удалось удалить задачу. Пожалуйста, попробуйте позже.');
    }
  };

  const handleTaskCompletion = async (taskId) => {
    try {
      await taskService.markTaskCompleted(id, taskId);

      // Обновляем список задач
      const response = await taskService.getTaskList(id);
      setTasks(response.toDoTasks || []);
    } catch (err) {
      console.error('Ошибка при обновлении статуса задачи:', err);
      setError('Не удалось обновить статус задачи. Пожалуйста, попробуйте позже.');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
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
      </Paper>

      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenTaskDialog()}
        >
          Добавить задачу
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <List>
        {tasks.map((task, index) => (
          <React.Fragment key={task.id}>
            <ListItem>
              <IconButton
                edge="start"
                onClick={() => handleTaskCompletion(task.id)}
              >
                {task.completed ? (
                  <CheckCircleIcon color="success" />
                ) : (
                  <RadioButtonUncheckedIcon />
                )}
              </IconButton>
              <ListItemText
                primary={
                  <Typography
                    style={{
                      textDecoration: task.completed ? 'line-through' : 'none'
                    }}
                  >
                    {task.title}
                  </Typography>
                }
                secondary={
                  <Box>
                    {task.description && (
                      <Typography variant="body2" color="text.secondary">
                        {task.description}
                      </Typography>
                    )}
                    <Box display="flex" gap={1} mt={1}>
                      <Chip
                        label={task.priority}
                        color={getPriorityColor(task.priority)}
                        size="small"
                      />
                      <Chip
                        label={`${task.points} очков`}
                        color="info"
                        size="small"
                      />
                      {task.dueDate && (
                        <Chip
                          label={new Date(task.dueDate).toLocaleDateString()}
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Box>
                  </Box>
                }
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
        ))}
      </List>

      <Dialog open={openTaskDialog} onClose={handleCloseTaskDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTask ? 'Редактировать задачу' : 'Создать задачу'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Название"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Описание"
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
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
            <TextField
              fullWidth
              label="Очки"
              type="number"
              value={taskForm.points}
              onChange={(e) => setTaskForm({ ...taskForm, points: parseInt(e.target.value) || 0 })}
              margin="normal"
              inputProps={{ min: 0 }}
              required
            />
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
              <DatePicker
                label="Срок выполнения"
                value={taskForm.dueDate}
                onChange={(newValue) => setTaskForm({ ...taskForm, dueDate: newValue })}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
              />
            </LocalizationProvider>
          </Box>
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