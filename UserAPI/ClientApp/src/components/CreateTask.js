import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

const CreateTask = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const listId = queryParams.get('listId');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    points: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Создаем задачу
      await axios.post(`/pyd-user-api-handler/create-task?pydId=${listId}`, {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        points: parseInt(formData.points)
      });

      // Перенаправляем на страницу списка задач
      navigate(`/task/${listId}`);
    } catch (err) {
      console.error('Ошибка при создании задачи:', err);
      setError('Не удалось создать задачу. Пожалуйста, попробуйте позже.');
      setLoading(false);
    }
  };

  return (
    <div className="task-form">
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Создание новой задачи
        </Typography>

        {error && (
          <Typography color="error" paragraph>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <Box mb={2}>
            <TextField
              label="Название задачи"
              name="title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />
          </Box>

          <Box mb={2}>
            <TextField
              label="Описание"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
            />
          </Box>

          <Box mb={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="priority-label">Приоритет</InputLabel>
              <Select
                labelId="priority-label"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                label="Приоритет"
              >
                <MenuItem value="low">Низкий</MenuItem>
                <MenuItem value="medium">Средний</MenuItem>
                <MenuItem value="high">Высокий</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box mb={3}>
            <TextField
              label="Срок выполнения"
              name="dueDate"
              type="datetime-local"
              value={formData.dueDate}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>

          <Box mb={3}>
            <TextField
              label="Очки"
              name="points"
              type="number"
              value={formData.points}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
              min="0"
              required
            />
          </Box>

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button 
              variant="outlined" 
              onClick={() => navigate(`/task/${listId}`)}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Создание...' : 'Создать задачу'}
            </Button>
          </Box>
        </form>
      </Paper>
    </div>
  );
};

export default CreateTask; 