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
  DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
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

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Поиск списков задач
      </Typography>

      <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 1, mb: 4 }}>
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

      <List>
        {taskLists.map((list) => {
            let imageSrc = null;
            if (list.imageData && list.imageMimeType) { 
                imageSrc = `data:${list.imageMimeType};base64,${list.imageData}`; 
            } else if (list.imageData) { // Fallback
                imageSrc = `data:image/jpeg;base64,${list.imageData}`; 
                console.warn(`Mime type missing for search result list ${list.id}. Falling back to jpeg.`);
            }

            return (
                <Paper sx={{ mb: 2, overflow: 'hidden' }} key={list.id}>
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
                                <Typography variant="body2" color="text.secondary">
                                    Очки: {list.totalPoints || 0} / {list.requiredPoints || 0}
                                </Typography>
                                </Box>
                            </Box>
                            }
                        />
                        <ListItemSecondaryAction>
                            <IconButton
                            edge="end"
                            aria-label="view"
                            onClick={() => handleViewList(list)}
                            >
                            <VisibilityIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                </Paper>
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