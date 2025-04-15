import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import taskService from '../services/taskService';

const EditTaskList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredPoints, setRequiredPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTaskList = async () => {
      try {
        const response = await taskService.getTaskList(id);
        setTitle(response.title);
        setDescription(response.description || '');
        setRequiredPoints(response.requiredPoints || 0);
        setLoading(false);
      } catch (err) {
        console.error('Ошибка при загрузке списка задач:', err);
        setError('Не удалось загрузить список задач. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    };

    fetchTaskList();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await taskService.updateTaskList(id, title, description, requiredPoints);
      navigate(`/task-list/${id}`);
    } catch (err) {
      console.error('Ошибка при обновлении списка задач:', err);
      setError('Не удалось обновить список задач. Пожалуйста, попробуйте позже.');
      setLoading(false);
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
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Редактирование списка задач
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            multiline
            rows={4}
          />
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            border: '1px solid #1976d2', 
            borderRadius: 1,
            backgroundColor: '#f5f5f5'
          }}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Требуемое количество очков
            </Typography>
            <TextField
              fullWidth
              label="Очки"
              type="number"
              value={requiredPoints}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                console.log('Изменение очков:', value);
                setRequiredPoints(value);
              }}
              margin="normal"
              inputProps={{ min: 0 }}
              sx={{ 
                '& .MuiInputLabel-root': { color: 'primary.main' },
                '& .MuiOutlinedInput-root': { 
                  '&:hover fieldset': { borderColor: 'primary.main' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                }
              }}
            />
          </Box>
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/task-list/${id}`)}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Сохранить'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default EditTaskList; 