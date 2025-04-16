import React, { useState } from 'react';
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
import taskService from '../services/taskService';

const SearchTaskLists = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [taskLists, setTaskLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedList, setSelectedList] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setTaskLists([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await taskService.searchTaskLists(searchQuery);
      console.log('Ответ от сервера:', response);
      setTaskLists(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Ошибка при поиске списков задач:', err);
      setError('Не удалось выполнить поиск. Пожалуйста, попробуйте позже.');
      setTaskLists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
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
    try {
      await taskService.subscribeToTaskList(list.id);
      // Обновляем список после подписки
      const updatedLists = taskLists.map(l => 
        l.id === list.id 
          ? { ...l, isSubscribed: true }
          : l
      );
      setTaskLists(updatedLists);
      handleCloseViewDialog();
    } catch (err) {
      console.error('Ошибка при подписке на список:', err);
      setError('Не удалось подписаться на список. Пожалуйста, попробуйте позже.');
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Поиск списков задач
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Введите название списка для поиска..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            endAdornment: (
              <Button 
                variant="contained" 
                onClick={handleSearch}
                disabled={loading}
                sx={{ ml: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Поиск'}
              </Button>
            ),
          }}
        />
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {taskLists.length === 0 && !loading && searchQuery && (
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
        {taskLists.map((list) => (
          <Paper sx={{ mb: 2 }} key={list.id}>
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
                  sx={{ mr: 1 }}
                >
                  <VisibilityIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="subscribe"
                  onClick={() => handleSubscribe(list)}
                  disabled={list.isSubscribed}
                >
                  <AddIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </Paper>
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