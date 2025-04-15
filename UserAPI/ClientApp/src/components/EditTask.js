import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { ru } from 'date-fns/locale';
import axios from 'axios';
import taskService from '../services/taskService';

const EditTask = () => {
  const { listId, taskId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    completed: false,
    priority: 'medium',
    dueDate: '',
    points: 0
  });

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const tasks = await taskService.getTasks(listId);
        const task = tasks.find(t => t.id === parseInt(taskId));
        if (task) {
          setFormData({
            title: task.title,
            description: task.description || '',
            completed: task.completed,
            priority: task.priority,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
            points: task.points
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке задачи:', error);
        setError('Не удалось загрузить задачу');
        setLoading(false);
      }
    };

    fetchTask();
  }, [listId, taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await taskService.updateTask(
        listId,
        taskId,
        formData.title,
        formData.description,
        formData.completed,
        formData.priority,
        formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        formData.points
      );
      navigate(`/task/${listId}`);
    } catch (error) {
      console.error('Ошибка при обновлении задачи:', error);
      setError('Не удалось обновить задачу');
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
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Редактировать задачу
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Название"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            margin="normal"
          />

          <TextField
            fullWidth
            label="Описание"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={4}
            margin="normal"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Приоритет</InputLabel>
            <Select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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
              value={formData.dueDate}
              onChange={(newValue) => setFormData({ ...formData, dueDate: newValue })}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
            />
          </LocalizationProvider>

          <TextField
            label="Очки"
            type="number"
            value={formData.points}
            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
            fullWidth
            required
            margin="normal"
            inputProps={{ min: 0 }}
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/task/${listId}`)}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              Сохранить
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default EditTask; 