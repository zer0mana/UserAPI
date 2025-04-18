import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Alert,
  Grid,
  Tooltip,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import taskService from '../services/taskService';

// Функция для конвертации ArrayBuffer/Uint8Array в Base64 (УДАЛЯЕМ ИЛИ КОММЕНТИРУЕМ - НЕ НУЖНА ЗДЕСЬ)
/*
const arrayBufferToBase64 = (buffer) => {
  if (!buffer) return null;
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};
*/

const TaskLists = () => {
  const [taskLists, setTaskLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTaskLists = async () => {
      try {
        const response = await taskService.getTaskLists();
        console.log('Полученные списки задач:', response);
        setTaskLists(response || []);
        setLoading(false);
      } catch (err) {
        console.error('Ошибка при загрузке списков задач:', err);
        setError('Не удалось загрузить списки задач. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    };

    fetchTaskLists();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот список задач?')) {
      try {
        await taskService.deleteTaskList(id);
        setTaskLists(taskLists.filter(list => list.id !== id));
      } catch (err) {
        console.error('Ошибка при удалении списка задач:', err);
        setError('Не удалось удалить список задач.');
      }
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
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Мои списки задач
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          to="/create-task-list"
        >
          Создать список
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {taskLists.length === 0 && !loading && (
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
              У вас пока нет списков задач. Создайте новый!
          </Typography>
      )}

      <Grid container spacing={3}>
        {taskLists.map((list) => {
          console.log('Processing Task List:', list);
          let imageSrc = null;
          // Используем imageData напрямую, так как это уже Base64 строка
          if (list.imageData && list.imageMimeType) { 
            console.log('Image data (base64 string) and mime type found:', list.imageMimeType);
            imageSrc = `data:${list.imageMimeType};base64,${list.imageData}`; 
            console.log('Generated imageSrc:', imageSrc.substring(0, 100) + '...');
          } else {
              console.log(`No image data or mime type for task list ${list.id}`);
          }

          return (
            <Grid item xs={12} key={list.id}>
              <Paper 
                elevation={2} 
                sx={{ 
                  overflow: 'hidden', 
                  p: 2, 
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 4 }
                }}
                onClick={() => navigate(`/task-list/${list.id}`)}
              >
                {/* Отображение изображения */}
                {imageSrc && (
                  <Box
                    component="img"
                    src={imageSrc}
                    alt={list.title}
                    sx={{
                      width: '100%', 
                      height: '200px',
                      objectFit: 'cover', 
                      display: 'block', 
                      mb: 2 
                    }}
                  />
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
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
                              color: list.streak > 100 ? 'purple' : list.streak > 0 ? 'orange' : 'grey.400',
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
                  <Box 
                    sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }} 
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconButton 
                      aria-label="edit" 
                      component={Link}
                      to={`/edit-task-list/${list.id}`}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      aria-label="delete" 
                      onClick={() => handleDelete(list.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default TaskLists; 