import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchRecommendedLists();
  }, []);

  const fetchRecommendedLists = async () => {
    try {
      const response = await taskService.getRecommendedTaskLists();
      setTaskLists(response);
      setLoading(false);
    } catch (err) {
      console.error('Ошибка при загрузке рекомендуемых списков:', err);
      setError('Не удалось загрузить рекомендуемые списки. Пожалуйста, попробуйте позже.');
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
    try {
      await taskService.subscribeToTaskList(selectedList.id);
      handleCloseCopyDialog();
      // Обновляем список рекомендаций
      fetchRecommendedLists();
    } catch (err) {
      console.error('Ошибка при подписке на список:', err);
      setError('Не удалось подписаться на список. Пожалуйста, попробуйте позже.');
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
        {taskLists.map((list) => (
          <React.Fragment key={list.id}>
            <ListItem>
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
                        Задач: {list.taskCount}
                      </Typography>
                      {list.totalPoints > 0 && (
                        <Typography variant="body2" color="text.secondary">
                          Всего баллов: {list.totalPoints}
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
            <Divider />
          </React.Fragment>
        ))}
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
        <DialogTitle>
          Подписаться на список
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Вы уверены, что хотите подписаться на список "{selectedList?.title}"?
          </Typography>
          {selectedList?.description && (
            <Typography variant="body2" color="text.secondary" paragraph>
              {selectedList.description}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCopyDialog}>Отмена</Button>
          <Button onClick={handleCopyList} variant="contained" color="primary">
            Подписаться
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecommendedTaskLists; 