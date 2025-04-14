import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Button, 
  Grid, 
  Box,
  CircularProgress
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

const TaskList = () => {
  const [taskLists, setTaskLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTaskLists = async () => {
      try {
        const userId = localStorage.getItem('userId');
        console.log('Получен userId из localStorage:', userId);
        
        if (!userId) {
          setError('Пользователь не авторизован');
          setLoading(false);
          return;
        }

        const parsedUserId = parseInt(userId, 10);
        if (isNaN(parsedUserId)) {
          console.error('userId не является числом:', userId);
          setError('Некорректный ID пользователя');
          setLoading(false);
          return;
        }

        console.log('Отправка запроса с userId:', parsedUserId);
        const response = await axios.get(`/pyd-user-api-handler/view-pyd-list?userId=${parsedUserId}`);
        console.log('Ответ от сервера:', response.data);
        console.log('Первый элемент списка:', response.data[0]);
        setTaskLists(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Ошибка при загрузке списков задач:', err);
        if (err.response) {
          console.error('Детали ошибки:', {
            status: err.response.status,
            data: err.response.data,
            headers: err.response.headers
          });
        }
        setError('Не удалось загрузить списки задач. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    };

    fetchTaskLists();
  }, []);

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

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Мои списки задач
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          component={RouterLink} 
          to="/create-task-list"
        >
          Создать новый список
        </Button>
      </Box>

      {taskLists.length === 0 ? (
        <Typography variant="body1" align="center">
          У вас пока нет списков задач. Создайте новый список, чтобы начать.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {taskLists.map((list) => (
            <Grid item xs={12} sm={6} md={4} key={list.id}>
              <Card className="task-card">
                <CardContent className="task-card-content">
                  <Typography variant="h6" component="h2">
                    {list.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {list.description || 'Без описания'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Задач: {list.toDoTasks?.length || 0}
                  </Typography>
                </CardContent>
                <CardActions className="task-card-actions">
                  <Button 
                    size="small" 
                    color="primary" 
                    component={RouterLink} 
                    to={`/task/${list.id}`}
                    onClick={() => {
                      console.log('Переход к списку задач с ID:', list.id);
                      console.log('Полный объект списка:', JSON.stringify(list, null, 2));
                    }}
                  >
                    Открыть
                  </Button>
                  <Button 
                    size="small" 
                    color="secondary"
                    onClick={() => {
                      // Здесь будет логика удаления списка
                      console.log('Удалить список', list.id);
                    }}
                  >
                    Удалить
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
};

export default TaskList; 