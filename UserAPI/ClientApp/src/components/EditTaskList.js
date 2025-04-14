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
import axios from 'axios';

const EditTaskList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setTitle(response.data.title);
        setDescription(response.data.description || '');
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
      const userDayNumber = localStorage.getItem('userId');
      if (!userDayNumber) {
        setError('Пользователь не авторизован');
        setLoading(false);
        return;
      }

      await axios.put(`/pyd-user-api-handler/update-pyd-template/${id}`, {
        title: title,
        description: description
      });

      navigate(`/task/${id}`);
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
            multiline
            rows={4}
            margin="normal"
          />

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

export default EditTaskList; 