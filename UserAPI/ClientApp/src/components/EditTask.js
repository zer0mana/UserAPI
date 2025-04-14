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

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [task, setTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: null
  });

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const userDayNumber = localStorage.getItem('userId');
        if (!userDayNumber) {
          setError('Пользователь не авторизован');
          return;
        }

        const response = await axios.get(`/pyd-user-api-handler/view-pyd/${id}?userDayNumber=${parseInt(userDayNumber, 10)}`);
        const taskData = response.data.tasks.find(t => t.id === parseInt(id, 10));
        if (taskData) {
          setTask({
            title: taskData.title,
            description: taskData.description || '',
            priority: taskData.priority,
            dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null
          });
        }
      } catch (err) {
        console.error('Ошибка при загрузке задачи:', err);
        setError('Не удалось загрузить задачу');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userDayNumber = localStorage.getItem('userId');
      if (!userDayNumber) {
        setError('Пользователь не авторизован');
        return;
      }

      await axios.put(`/pyd-user-api-handler/update-task?pydId=${id}&taskId=${parseInt(id, 10)}`, {
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate
      });

      navigate(`/task/${id}`);
    } catch (err) {
      console.error('Ошибка при обновлении задачи:', err);
      setError('Не удалось обновить задачу');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Редактирование задачи
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
            value={task.title}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
            required
            margin="normal"
          />

          <TextField
            fullWidth
            label="Описание"
            value={task.description}
            onChange={(e) => setTask({ ...task, description: e.target.value })}
            multiline
            rows={4}
            margin="normal"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Приоритет</InputLabel>
            <Select
              value={task.priority}
              onChange={(e) => setTask({ ...task, priority: e.target.value })}
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
              value={task.dueDate}
              onChange={(newValue) => setTask({ ...task, dueDate: newValue })}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
            />
          </LocalizationProvider>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Сохранить'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(`/task/${id}`)}
            >
              Отмена
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default EditTask; 