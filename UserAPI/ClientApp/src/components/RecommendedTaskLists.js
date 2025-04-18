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
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
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
    setSelectedList(null);
    setCopyForm({
      title: '',
      description: ''
    });
  };

  const handleCopyList = async () => {
    if (!selectedList) return;
    try {
      // Создаем FormData, даже если изображения нет (бэкенд обработает)
      const formData = new FormData();
      formData.append('Title', selectedList.title + ' (Копия)');
      formData.append('Description', selectedList.description || '');
      formData.append('RequiredPoints', selectedList.requiredPoints?.toString() || '0');
      // Изображение копировать не будем в этой версии, пользователь может добавить сам
      // Если нужно копировать, потребуется получить imageData и mimeType
      
      await taskService.createTaskList(formData); 
      handleCloseCopyDialog();
      navigate('/'); // Переходим к списку пользователя
    } catch (error) {
      console.error('Ошибка при копировании списка задач:', error);
      alert('Не удалось скопировать список задач');
      handleCloseCopyDialog();
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
      <Typography variant="h4" component="h1" gutterBottom>
        Рекомендуемые списки задач
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <List>
        {taskLists.map((list) => {
          let imageSrc = null;
          if (list.imageData && list.imageMimeType) { 
            imageSrc = `data:${list.imageMimeType};base64,${list.imageData}`; 
          } else if (list.imageData) { // Fallback
            imageSrc = `data:image/jpeg;base64,${list.imageData}`; 
            console.warn(`Mime type missing for recommended list ${list.id}. Falling back to jpeg.`);
          }
          
          return (
            <React.Fragment key={list.id}>
              <Paper elevation={1} sx={{ mb: 2, overflow: 'hidden' }}>
                {imageSrc && (
                  <Box
                    component="img"
                    src={imageSrc}
                    alt={list.title}
                    sx={{ width: '100%', height: 140, objectFit: 'cover' }}
                  />
                )}
                <ListItem sx={{ pt: imageSrc ? 1 : 2 }}>
                  <ListItemText
                    primary={list.title}
                    secondary={
                      <Box>
                        {list.description && (
                          <Typography variant="body2" color="text.secondary">
                            {list.description}
                          </Typography>
                        )}
                        <Box display="flex" gap={1} mt={1}>
                          <Typography variant="body2" color="text.secondary">
                            Задач: {list.taskCount || 0}
                          </Typography>
                          {list.totalPoints > 0 && (
                            <Typography variant="body2" color="text.secondary">
                              Всего баллов: {list.requiredPoints || 0}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="view"
                      onClick={() => handleViewList(list)}
                      sx={{ mr: 1 }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="copy"
                      onClick={() => handleOpenCopyDialog(list)}
                    >
                      <AddIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </Paper>
            </React.Fragment>
          );
        })}
      </List>

      {/* Диалог просмотра списка */}
      <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedList?.title}
        </DialogTitle>
        <DialogContent>
          {selectedList?.description && (
            <Typography variant="body1" paragraph>
              {selectedList.description}
            </Typography>
          )}
          <List>
            {selectedList?.toDoTasks?.map((task) => (
              <ListItem key={task.id}>
                <ListItemText
                  primary={task.title}
                  secondary={
                    <Box>
                      {task.description && (
                        <Typography variant="body2" color="text.secondary">
                          {task.description}
                        </Typography>
                      )}
                      <Box display="flex" gap={1} mt={1}>
                        {task.points > 0 && (
                          <Typography variant="body2" color="text.secondary">
                            Баллов: {task.points}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Закрыть</Button>
          <Button 
            onClick={() => {
              handleCloseViewDialog();
              handleOpenCopyDialog(selectedList);
            }}
            variant="contained"
            color="primary"
          >
            Добавить в свои списки
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог копирования списка */}
      <Dialog open={openCopyDialog} onClose={handleCloseCopyDialog}>
        <DialogTitle>Копировать список</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите скопировать список "{selectedList?.title}" в свои списки дел?
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