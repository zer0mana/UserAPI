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
  Chip,
  Tooltip
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { ru } from 'date-fns/locale';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BarChartIcon from '@mui/icons-material/BarChart';
import taskService from '../services/taskService';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import authService from '../services/authService';

const TaskList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [streak, setStreak] = useState(0);
  
  // Состояние для диалога создания/редактирования задачи
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: null,
    points: 0,
    isPenalty: false
  });

  const [taskType, setTaskType] = useState('');
  const [pointsDeducted, setPointsDeducted] = useState(0);

  useEffect(() => {
    const fetchTaskList = async () => {
      try {
        const response = await taskService.getTaskList(id);
        console.log('Ответ от сервера при загрузке списка задач:', response);
        setTitle(response.title);
        setDescription(response.description || '');
        setTasks(response.toDoTasks || []);
        setStreak(response.streak || 0);
        
        // Проверяем, является ли текущий пользователь владельцем списка
        const currentUser = authService.getCurrentUser();
        console.log('Текущий пользователь:', currentUser);
        console.log('ID пользователя из токена:', currentUser?.id);
        console.log('ID владельца списка:', response.userId);
        console.log('Тип ID пользователя:', typeof currentUser?.id);
        console.log('Тип ID владельца:', typeof response.userId);
        setIsOwner(currentUser && Number(currentUser.id) === response.userId);
        
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
        points: task.points || 0,
        isPenalty: task.isPenalty || false
      });
    } else {
      setEditingTask(null);
      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: null,
        points: 0,
        isPenalty: false
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
          taskForm.points,
          taskForm.isPenalty
        );
      } else {
        // Создание новой задачи
        await taskService.createTask(
          id, 
          taskForm.title, 
          taskForm.description, 
          taskForm.priority, 
          taskForm.dueDate,
          taskForm.points,
          taskForm.isPenalty
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

  const handleCreatePenalty = async () => {
    try {
      await taskService.createPenalty(id, { taskType, pointsDeducted });
      console.log('Штраф создан успешно');
    } catch (error) {
      console.error('Ошибка при создании штрафа:', error);
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {description}
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2" color="text.secondary">
                Очки: {tasks.reduce((sum, task) => sum + (task.points || 0), 0)} / {tasks.reduce((sum, task) => sum + (task.requiredPoints || 0), 0)}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <LocalFireDepartmentIcon sx={{ 
                  color: streak > 100 ? 'purple' : streak > 0 ? 'orange' : 'grey.400',
                  fontSize: '1.2rem'
                }} />
                <Typography variant="body2" color={streak > 0 ? 'text.secondary' : 'text.disabled'}>
                  {streak || 0} дней
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box>
            {isOwner && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenTaskDialog()}
                sx={{ mr: 2 }}
              >
                Добавить задачу
              </Button>
            )}
            <Button
              variant="outlined"
              color="primary"
              startIcon={<BarChartIcon />}
              component={Link}
              to={`/analytics/${id}`}
            >
              Аналитика
            </Button>
          </Box>
        </Box>
        {isOwner && (
          <Box>
            <Button
              variant="outlined"
              color="primary"
              component={Link}
              to={`/edit-task-list/${id}`}
              startIcon={<EditIcon />}
            >
              Редактировать список
            </Button>
          </Box>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <List>
        {tasks.map((task) => (
          <React.Fragment key={task.id}>
            <ListItem>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center">
                    <Checkbox
                      checked={task.completed}
                      onChange={() => handleTaskCompletion(task.id)}
                      icon={<RadioButtonUncheckedIcon />}
                      checkedIcon={<CheckCircleIcon />}
                    />
                    <Typography
                      sx={{
                        textDecoration: task.completed ? 'line-through' : 'none',
                        color: task.completed ? 'text.secondary' : 'text.primary'
                      }}
                    >
                      {task.title}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box>
                    {task.description && (
                      <Typography variant="body2" color="text.secondary">
                        {task.description}
                      </Typography>
                    )}
                    <Box display="flex" gap={1} mt={1}>
                      {task.dueDate && (
                        <Chip
                          label={new Date(task.dueDate).toLocaleDateString()}
                          variant="outlined"
                          size="small"
                        />
                      )}
                      {task.points > 0 && (
                        <Chip
                          label={`${task.points} баллов`}
                          color="primary"
                          size="small"
                        />
                      )}
                      {task.isPenalty && (
                        <Chip
                          label="Штраф"
                          color="error"
                          size="small"
                        />
                      )}
                    </Box>
                  </Box>
                }
              />
              {isOwner && (
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => handleOpenTaskDialog(task)}
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
              )}
            </ListItem>
            <Divider />
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
              <InputLabel>Тип задачи</InputLabel>
              <Select
                value={taskForm.isPenalty ? 'penalty' : 'regular'}
                onChange={(e) => setTaskForm({ ...taskForm, isPenalty: e.target.value === 'penalty' })}
                label="Тип задачи"
              >
                <MenuItem value="regular">Обычная задача</MenuItem>
                <MenuItem value="penalty">Штраф</MenuItem>
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