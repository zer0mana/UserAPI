import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tooltip,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ReportIcon from '@mui/icons-material/Report';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import taskService from '../services/taskService';

const RecommendedTaskLists = () => {
  const [taskLists, setTaskLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedList, setSelectedList] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openCopyDialog, setOpenCopyDialog] = useState(false);
  const [copyForm, setCopyForm] = useState({
    title: '',
    description: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const response = await taskService.getRecommendedTaskLists();
        setTaskLists(response || []);
        setLoading(false);
      } catch (err) {
        console.error('Ошибка при загрузке рекомендуемых списков:', err);
        setError('Не удалось загрузить рекомендуемые списки.');
        setLoading(false);
      }
    };
    fetchRecommended();
  }, []);

  const handleViewList = (list) => {
    setSelectedList(list);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedList(null);
  };

  const handleOpenCopyDialog = (list) => {
    setSelectedList(list);
    setCopyForm({
      title: `${list.title} (копия)`,
      description: list.description || ''
    });
    setOpenCopyDialog(true);
  };

  const handleCloseCopyDialog = () => {
    setOpenCopyDialog(false);
    setCopyForm({
      title: '',
      description: ''
    });
  };

  const handleCopyList = async () => {
    if (!selectedList) return;
    try {
      const formData = new FormData();
      formData.append('Title', selectedList.title + ' (Копия)');
      formData.append('Description', selectedList.description || '');
      formData.append('RequiredPoints', selectedList.requiredPoints?.toString() || '0');

      await taskService.createTaskList(formData);
      handleCloseCopyDialog();
      setOpenViewDialog(false);
      setSelectedList(null);
      navigate('/');
    } catch (error) {
      console.error('Ошибка при копировании списка задач:', error);
      alert('Не удалось скопировать список задач');
      handleCloseCopyDialog();
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
        <Typography variant="h4" component="h1" gutterBottom>
          Рекомендуемые списки задач
        </Typography>

        {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
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
              console.warn(`Mime type missing for recommended list ${list.id}. Falling back to jpeg.`);
            }

            return (
                <Grid item xs={4} key={list.id}>
                  <Paper
                      sx={{
                        mb: 0,
                        overflow: 'hidden',
                        height: 280,
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
                          }
                      />
                      <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Задач: {list.taskCount || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Сохранили: {list.subscriberCount !== undefined ? list.subscriberCount : 'N/A'}
                        </Typography>
                        <Tooltip title={list.isSubscribed ? "Список у вас сохранен" : "Сохранить список себе"}>
                          <Box component="span" sx={{ display: 'inline-flex', ml: 0 }}>
                            {list.isSubscribed ? (
                                <BookmarkAddedIcon fontSize="small" color="primary" />
                            ) : (
                                <BookmarkAddOutlinedIcon fontSize="small" color="action" />
                            )}
                          </Box>
                        </Tooltip>
                        <Box component="span" sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Добавить себе">
                            <Box component="span" onClick={(e) => {e.stopPropagation(); handleOpenCopyDialog(list);}}>
                              <IconButton size="small" sx={{ p: 0.5 }}>
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Tooltip>
                          <Tooltip title="Пожаловаться">
                            <Box component="span" onClick={(e) => handleReportList(list.id, e)}>
                              <IconButton size="small" sx={{ p: 0.5 }}>
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
                                      width: 80,
                                      height: 80,
                                      objectFit: 'cover',
                                      mr: 2,
                                      borderRadius: 1
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
                variant="contained"
                color="primary"
                onClick={() => {
                  handleOpenCopyDialog(selectedList);
                }}
            >
              Добавить в свои списки
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openCopyDialog} onClose={handleCloseCopyDialog}>
          <DialogTitle>Копировать список "{selectedList?.title}"?</DialogTitle>
          <DialogContent>
            {selectedList?.description && (
                <Typography paragraph color="text.secondary">
                  {selectedList.description}
                </Typography>
            )}
            <Typography>
              Список будет добавлен в "Мои списки".
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCopyDialog}>Отмена</Button>
            <Button onClick={handleCopyList} variant="contained" color="primary">
              Копировать
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
};

export default RecommendedTaskLists; 