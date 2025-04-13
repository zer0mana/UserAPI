import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

const CreateTaskList = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: ''
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
      // Здесь будет реальный userId, в данном примере используем 1
      const userId = 1;
      
      // Создаем новый список задач
      const response = await axios.post('/pyd-user-api-handler/create-pyd', {
        userId: userId,
        title: formData.title,
        description: formData.description
      });

      // Перенаправляем на страницу списка задач
      navigate('/');
    } catch (err) {
      console.error('Ошибка при создании списка задач:', err);
      setError('Не удалось создать список задач. Пожалуйста, попробуйте позже.');
      setLoading(false);
    }
  };

  return (
    <div className="task-form">
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Создание нового списка задач
        </Typography>

        {error && (
          <Typography color="error" paragraph>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <Box mb={2}>
            <TextField
              label="Название списка"
              name="title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />
          </Box>

          <Box mb={3}>
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

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/')}
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
              {loading ? 'Создание...' : 'Создать список'}
            </Button>
          </Box>
        </form>
      </Paper>
    </div>
  );
};

export default CreateTaskList; 