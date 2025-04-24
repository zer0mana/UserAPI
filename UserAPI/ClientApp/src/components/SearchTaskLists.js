import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Tooltip,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReportIcon from '@mui/icons-material/Report';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import taskService from '../services/taskService';

const SearchTaskLists = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [taskLists, setTaskLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedList, setSelectedList] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await taskService.searchTaskLists(searchQuery);
      console.log('Результаты поиска:', response);
      setTaskLists(response || []);
    } catch (err) {
      console.error('Ошибка при поиске списков задач:', err);
      setError('Не удалось выполнить поиск. Пожалуйста, попробуйте позже.');
      setTaskLists([]); // Очищаем результаты при ошибке
    } finally {
      setLoading(false);
    }
  };

  const handleViewList = (list) => {
    setSelectedList(list);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedList(null);
  };

  const handleSubscribe = async (list) => {
    if (!list) return;
    try {
      await taskService.subscribeToTaskList(list.id);
      alert(`Вы успешно подписались на список "${list.title}"`);
      // Можно обновить UI, чтобы показать, что пользователь подписан
      handleCloseViewDialog();
    } catch (err) {
      console.error('Ошибка при подписке на список:', err);
      alert('Не удалось подписаться на список.');
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

  return (
      <Box sx={{ maxWidth: 1050, mx: 'auto', mt: 4, p: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Поиск списков задач
        </Typography>

        <Box sx={{ overflow: 'hidden', mb: 4 }}>
          <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 1, minWidth: 800, py: 1 }}>
            <TextField
                fullWidth
                variant="outlined"
                label="Введите запрос для поиска"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
                type="submit"
                variant="contained"
                disabled={loading || !searchQuery.trim()}
                startIcon={<SearchIcon />}
            >
              {loading ? <CircularProgress size={24} /> : 'Найти'}
            </Button>
          </Box>
        </Box>

        {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
        )}

        {loading && (
            <Box display="flex" justifyContent="center" sx={{ my: 4}}>
              <CircularProgress />
            </Box>
        )}

        {!loading && taskLists.length === 0 && searchQuery && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Списки задач не найдены
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Попробуйте изменить параметры поиска
              </Typography>
            </Box>
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
            let imageSrc = null;
            if (list.imageData && list.imageMimeType) {
              imageSrc = `data:${list.imageMimeType};base64,${list.imageData}`;
            } else if (list.imageData) { // Fallback
              imageSrc = `data:image/jpeg;base64,${list.imageData}`;
              console.warn(`Mime type missing for search result list ${list.id}. Falling back to jpeg.`);
            }

            return (
                <Grid item xs={4} key={list.id}>
                  <Paper
                      sx={{
                        mb: 0,
                        overflow: 'hidden',
                        height: 260,
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 3 }
                      }}
                      onClick={() => handleViewList(list)}
                  >
                    {imageSrc && (
                        <Box
                            component="img"
                            src={imageSrc}
                            alt={list.title}
                            sx={{ width: '100%', height: 140, objectFit: 'cover', flexShrink: 0 }}
                        />
                    )}
                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <ListItemText
                          sx={{ mb: 1 }}
                          primary={list.title}
                          secondary={
                            <Box>
                              <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: 'block',
                                    mb: 1
                                  }}
                                  title={list.description || ''}
                              >
                                {list.description || 'Без описания'}
                              </Typography>
                              <Box display="flex" gap={1} mt={1} flexWrap="wrap" alignItems="center">
                                <Typography variant="body2" color="text.secondary">
                                  Задач: {list.taskCount || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Сохранили: {list.subscriberCount !== undefined ? list.subscriberCount : 'N/A'}
                                </Typography>
                                <Tooltip title={list.isSubscribed ? "Список у вас сохранен" : "Сохранить список себе"}>
                                  <Box component="span" sx={{ display: 'inline-flex', ml: 1 }}>
                                    {list.isSubscribed ? (
                                        <BookmarkAddedIcon fontSize="small" color="primary" />
                                    ) : (
                                        <BookmarkAddOutlinedIcon fontSize="small" color="action" />
                                    )}
                                  </Box>
                                </Tooltip>
                                <Box component="span" onClick={(e) => e.stopPropagation()} sx={{ ml: 'auto', display: 'inline-flex' }}>
                                  <Tooltip title="Пожаловаться">
                                    <IconButton
                                        aria-label="report"
                                        onClick={(e) => handleReportList(list.id, e)}
                                        size="small"
                                        sx={{ p: 0.5 }}
                                    >
                                      <ReportIcon fontSize="small" color="action" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>
                            </Box>
                          }
                      />
                    </Box>
                  </Paper>
                </Grid>
            );
          })}
        </Grid>

        <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
          <Box sx={{ p: 3, pb: 0 }}>
            <DialogTitle sx={{ p: 0, mb: 1 }}>
              <Typography variant="h5" component="div">
                {selectedList?.title || "Загрузка..."}
              </Typography>
            </DialogTitle>
          </Box>
          <DialogContent sx={{ pt: 1 }}>
            {selectedList?.description && (
                <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                  {selectedList.description}
                </Typography>
            )}

            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" component="div" gutterBottom>
              Задачи:
            </Typography>

            {selectedList?.toDoTasks && selectedList.toDoTasks.length > 0 ? (
                <List dense>
                  {selectedList.toDoTasks.map((task, index) => {
                    let taskImageSrc = null;
                    if (task.imageData && task.imageMimeType) {
                      taskImageSrc = `data:${task.imageMimeType};base64,${task.imageData}`;
                    } else if (task.imageData) { // Fallback
                      taskImageSrc = `data:image/jpeg;base64,${task.imageData}`;
                    }

                    return (
                        <React.Fragment key={task.id}>
                          <Box component="li" sx={{ display: 'flex', alignItems: 'flex-start', py: 1.5 }}>
                            {taskImageSrc && (
                                <Box
                                    component="img"
                                    src={taskImageSrc}
                                    alt={`Изображение для ${task.title}`}
                                    sx={{
                                      width: 80, // Фикс. ширина 
                                      height: 80, // Фикс. высота
                                      objectFit: 'cover',
                                      mr: 2, // Отступ справа
                                      borderRadius: 1 // Небольшое скругление углов
                                    }}
                                />
                            )}
                            <ListItemText
                                primary={task.title}
                                secondary={
                                  <Box sx={{ mt: 0.5 }}>
                                    {task.description && (
                                        <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 0.5 }}>
                                          {task.description}
                                        </Typography>
                                    )}
                                  </Box>
                                }
                            />
                          </Box>
                          {index < selectedList.toDoTasks.length - 1 && <Divider component="li" />}
                        </React.Fragment>
                    )
                  })}
                </List>
            ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  В этом списке пока нет задач.
                </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseViewDialog}>Закрыть</Button>
            <Button
                onClick={() => handleSubscribe(selectedList)}
                variant="contained"
                color="primary"
                disabled={selectedList?.isSubscribed}
            >
              {selectedList?.isSubscribed ? 'Вы подписаны' : 'Подписаться'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
};

export default SearchTaskLists;