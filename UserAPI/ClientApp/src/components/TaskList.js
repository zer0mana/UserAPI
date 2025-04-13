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
        // Здесь будет реальный userId, в данном примере используем 1
        const userId = 1;
        const response = await axios.get(`/pyd-user-api-handler/view-pyd-list?userId=${userId}`);
        setTaskLists(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Ошибка при загрузке списков задач:', err);
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
                    Задач: {list.taskCount || 0}
                  </Typography>
                </CardContent>
                <CardActions className="task-card-actions">
                  <Button 
                    size="small" 
                    color="primary" 
                    component={RouterLink} 
                    to={`/task/${list.id}`}
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