import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  Paper,
  CircularProgress,
  IconButton,
  Alert,
  Grid,
  Tooltip,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReportIcon from '@mui/icons-material/Report';
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

  const handleDelete = async (id, event) => {
    event.stopPropagation();
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

  const handleReportList = async (listId, event) => {
    event.stopPropagation();
    try {
      await taskService.reportTaskList(listId);
      console.log(`Жалоба на список с ID: ${listId} отправлена.`);
      alert(`Жалоба на список ${listId} успешно отправлена.`);
    } catch (error) {
      console.error(`Ошибка при отправке жалобы на список ${listId}:`, error);
      alert('Не удалось отправить жалобу. Пожалуйста, попробуйте позже.');
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
      <Box sx={{ maxWidth: 1050, mx: 'auto', mt: 4, p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1">
            Мои списки задач
          </Typography>
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

        <Grid
            container
            spacing={3}
            sx={{
              minWidth: 1020,
              pb: 2,
              mt: 4
            }}
        >
          {taskLists.map((list) => {
            console.log('Processing Task List:', list);
            let imageSrc = null;
            if (list.imageData && list.imageMimeType) {
              imageSrc = `data:${list.imageMimeType};base64,${list.imageData}`;
            } else {
              console.log(`No image data or mime type for task list ${list.id}`);
            }

            return (
                <Grid item xs={4} key={list.id}>
                  <Paper
                      elevation={2}
                      sx={{
                        overflow: 'hidden',
                        height: 280,
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 4 },
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                      onClick={() => navigate(`/task-list/${list.id}`)}
                  >
                    <Box sx={{ position: 'relative', width: '100%', height: 140, flexShrink: 0 }}>
                      {imageSrc ? (
                          <Box
                              component="img"
                              src={imageSrc}
                              alt={list.title}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block'
                              }}
                          />
                      ) : (
                          <Box sx={{ width: '100%', height: '100%', backgroundColor: 'grey.200' }} />
                      )}

                      {(list.streak !== undefined && list.streak !== null) && (
                          <Box
                              sx={{
                                position: 'absolute',
                                top: 8,
                                left: 8,
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                borderRadius: '10px',
                                p: '2px 6px',
                                display: 'inline-flex',
                                alignItems: 'center'
                              }}
                          >
                            <Tooltip title="Дней подряд">
                              <Box sx={{ display: 'flex', alignItems: 'center'}}>
                                <LocalFireDepartmentIcon sx={{
                                  color: list.streak > 100 ? 'purple' : list.streak > 0 ? 'orange' : 'white',
                                  fontSize: '1.1rem',
                                  mr: 0.5
                                }} />
                                <Typography
                                    variant="body2"
                                    sx={{
                                      color: 'white',
                                      fontWeight: 'bold'
                                    }}
                                >
                                  {list.streak || 0}
                                </Typography>
                              </Box>
                            </Tooltip>
                          </Box>
                      )}

                      {list.isCompleted && (
                          <Box
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                              }}
                          >
                            <Chip
                                label="Выполнено"
                                color="success"
                            />
                          </Box>
                      )}
                    </Box>
                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1, overflow: 'hidden' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 'medium', mr: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {list.title}
                        </Typography>
                      </Box>
                      <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{
                            mb: 1,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'block'
                          }}
                          title={list.description || ''}
                      >
                        {list.description || 'Без описания'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto' }}>
                        <Typography variant="body2" color="text.secondary">
                          Задач: {list.taskCount || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Очки: {list.totalPoints || 0} / {list.requiredPoints || 0}
                        </Typography>
                        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', flexShrink: 0, gap: 0.5 }}>
                          <Tooltip title="Редактировать">
                            <Box component="span" onClick={(e) => e.stopPropagation()}>
                              <IconButton
                                  aria-label="edit"
                                  component={Link}
                                  to={`/edit-task-list/${list.id}`}
                                  size="small"
                                  sx={{ p: 0.5 }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Tooltip>
                          <Tooltip title="Удалить">
                            <Box component="span" onClick={(e) => handleDelete(list.id, e)}>
                              <IconButton
                                  aria-label="delete"
                                  size="small"
                                  sx={{ p: 0.5 }}
                              >
                                <DeleteIcon fontSize="small"/>
                              </IconButton>
                            </Box>
                          </Tooltip>
                          <Tooltip title="Пожаловаться">
                            <Box component="span" onClick={(e) => handleReportList(list.id, e)}>
                              <IconButton
                                  aria-label="report"
                                  size="small"
                                  sx={{ p: 0.5 }}
                              >
                                <ReportIcon fontSize="small" color="action" />
                              </IconButton>
                            </Box>
                          </Tooltip>
                        </Box>
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