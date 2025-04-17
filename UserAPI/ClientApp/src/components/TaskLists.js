import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Button, 
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  Chip,
  Tooltip
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import taskService from '../services/taskService';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

const TaskLists = () => {
  const [taskLists, setTaskLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTaskLists = async () => {
      try {
        const response = await taskService.getTaskLists();
        setTaskLists(response);
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
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '100%', mx: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Мои списки задач
        </Typography>
      </Box>

      {taskLists.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            У вас пока нет списков задач
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Создайте новый список, чтобы начать.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {taskLists.map((list) => (
            <Grid item xs={12} key={list.id}>
              <Card sx={{ 
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                boxShadow: 2,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                },
                mb: 2,
                borderRadius: 2
              }}>
                <CardContent sx={{ 
                  flexGrow: 1, 
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%'
                }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 'medium', mb: 1 }}>
                      {list.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      {list.description || 'Без описания'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Задач: {list.taskCount || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Очки: {list.totalPoints || 0} / {list.requiredPoints || 0}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Tooltip title="Дней подряд">
                          <Box display="flex" alignItems="center">
                            <LocalFireDepartmentIcon sx={{ 
                              color: list.streak > 0 ? 'orange' : 'grey.400',
                              mr: 0.5 
                            }} />
                            <Typography variant="body2" color={list.streak > 0 ? 'text.secondary' : 'text.disabled'}>
                              {list.streak || 0} дней
                            </Typography>
                          </Box>
                        </Tooltip>
                      </Box>
                      {list.isCompleted && (
                        <Chip 
                          label="Выполнено" 
                          color="success" 
                          size="small"
                        />
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ ml: 3 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      component={RouterLink} 
                      to={`/task-list/${list.id}`}
                      size="large"
                      sx={{
                        minWidth: '120px',
                        height: '45px'
                      }}
                    >
                      Открыть
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default TaskLists; 