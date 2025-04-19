import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Checkbox,
  Chip,
  Tooltip,
  FormControlLabel,
  Input
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { ru } from 'date-fns/locale';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BarChartIcon from '@mui/icons-material/BarChart';
import taskService from '../services/taskService';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import authService from '../services/authService';
import PublishIcon from '@mui/icons-material/Publish';
import UnpublishedIcon from '@mui/icons-material/Unpublished';

// Функция для конвертации ArrayBuffer/Uint8Array в Base64 (если еще не импортирована или не определена)
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

const TaskList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [streak, setStreak] = useState(0);
  
  // Состояние для диалога создания/редактирования задачи
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: null,
    points: 0,
    isPenalty: false
  });

  const [taskType, setTaskType] = useState('');
  const [pointsDeducted, setPointsDeducted] = useState(0);
  const [taskImageFile, setTaskImageFile] = useState(null); // Для файла изображения задачи
  const [taskImagePreviewUrl, setTaskImagePreviewUrl] = useState(''); // Для предпросмотра
  const [publicationStatus, setPublicationStatus] = useState("None");
  const [rejectionReason, setRejectionReason] = useState(null);

  const fetchTaskListData = async () => {
      try {
        setLoading(true);
        const response = await taskService.getTaskList(id);
        console.log('Обновленные данные списка задач:', response);
        setTitle(response.title);
        setDescription(response.description || '');
        setTasks(response.toDoTasks || []);
        setStreak(response.streak || 0);
        setPublicationStatus(response.publicationStatus || "None");
        setRejectionReason(response.rejectionReason || null);

        const currentUser = authService.getCurrentUser();
        setIsOwner(currentUser && Number(currentUser.id) === response.userId);
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке списка задач:', err);
        setError('Не удалось загрузить список задач. Пожалуйста, попробуйте позже.');
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    fetchTaskListData();
  }, [id]);

  const handleTaskFileChange = (e) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setTaskImageFile(file);
          setTaskImagePreviewUrl(URL.createObjectURL(file));
      } else {
          setTaskImageFile(null);
          // Если отменили выбор файла, нужно вернуть превью к исходному изображению задачи (если оно было)
          if (editingTask && editingTask.imageData) {
            const base64String = editingTask.imageData; // Предполагаем, что с бека уже приходит base64
            const mimeType = editingTask.imageMimeType || 'image/jpeg';
            setTaskImagePreviewUrl(`data:${mimeType};base64,${base64String}`);
          } else {
            setTaskImagePreviewUrl('');
          }
      }
  };

  const handleOpenTaskDialog = (task = null) => {
    setTaskImageFile(null); // Сбрасываем файл при открытии
    if (task) {
      setEditingTask(task);
      setTaskForm({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        points: task.points || 0,
        isPenalty: task.isPenalty || false
      });
      // Устанавливаем превью для существующего изображения
      if (task.imageData) {
        const base64String = task.imageData; // Уже base64
        const mimeType = task.imageMimeType || 'image/jpeg';
        setTaskImagePreviewUrl(`data:${mimeType};base64,${base64String}`);
      } else {
        setTaskImagePreviewUrl('');
      }
    } else {
      // ... сброс формы для новой задачи ...
      setEditingTask(null);
      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: null,
        points: 0,
        isPenalty: false
      });
      setTaskImagePreviewUrl(''); // Сбрасываем превью
    }
    setOpenTaskDialog(true);
  };

  const handleCloseTaskDialog = () => {
    setOpenTaskDialog(false);
    setEditingTask(null);
    setTaskImageFile(null); // Сбрасываем файл при закрытии
    setTaskImagePreviewUrl(''); // Сбрасываем превью при закрытии
  };

  const handleTaskSubmit = async () => {
    try {
      console.log('Отправка данных задачи:', taskForm, taskImageFile);

      // Создаем FormData
      const formData = new FormData();
      formData.append('Title', taskForm.title);
      // Всегда добавляем описание, даже если пустое
      formData.append('Description', taskForm.description || ''); // Отправляем пустую строку, если null/undefined
      formData.append('Priority', taskForm.priority);
      if (taskForm.dueDate) {
        formData.append('DueDate', taskForm.dueDate.toISOString());
      }
      formData.append('Points', taskForm.points.toString());
      formData.append('IsPenalty', taskForm.isPenalty.toString());
      if (taskImageFile) {
          formData.append('ImageFile', taskImageFile);
      }
      // При обновлении, если файл не выбран, изображение не будет отправлено,
      // и бэкенд (по текущей логике) оставит старое.

      if (editingTask) {
        // Обновление существующей задачи
        await taskService.updateTask(id, editingTask.id, formData); // Отправляем formData
      } else {
        // Создание новой задачи
        await taskService.createTask(id, formData); // Отправляем formData
      }

      // Обновляем список задач
      const response = await taskService.getTaskList(id);
      console.log('Ответ при обновлении списка задач:', response);
      setTasks(response.toDoTasks || []);
      
      handleCloseTaskDialog();
    } catch (err) {
      console.error('Ошибка при сохранении задачи:', err);
      setError('Не удалось сохранить задачу. Пожалуйста, попробуйте позже.');
      // Не закрываем диалог при ошибке, чтобы пользователь мог исправить
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(id, taskId);
      
      // Обновляем список задач
      const response = await taskService.getTaskList(id);
      setTasks(response.toDoTasks || []);
    } catch (err) {
      console.error('Ошибка при удалении задачи:', err);
      setError('Не удалось удалить задачу. Пожалуйста, попробуйте позже.');
    }
  };

  const handleTaskCompletion = async (taskId) => {
    try {
      await taskService.markTaskCompleted(id, taskId);

      // Обновляем список задач
      const response = await taskService.getTaskList(id);
      setTasks(response.toDoTasks || []);
    } catch (err) {
      console.error('Ошибка при обновлении статуса задачи:', err);
      setError('Не удалось обновить статус задачи. Пожалуйста, попробуйте позже.');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleCreatePenalty = async () => {
    try {
      await taskService.createPenalty(id, { taskType, pointsDeducted });
      console.log('Штраф создан успешно');
    } catch (error) {
      console.error('Ошибка при создании штрафа:', error);
    }
  };

  const handlePublishRequest = async () => {
      if (!id) return;
      try {
          setLoading(true);
          const success = await taskService.requestPublication(id);
          if (success) {
              await fetchTaskListData();
          } else {
              setError('Не удалось отправить запрос на публикацию.');
          }
      } catch (err) {
          console.error('Ошибка при запросе публикации:', err);
          setError('Ошибка при запросе публикации.');
      } finally {
          setLoading(false);
      }
  };

  const handleUnpublish = async () => {
      if (!id) return;
      if (window.confirm('Вы уверены, что хотите снять список с публикации?')) {
          try {
              setLoading(true);
              const success = await taskService.unpublishTaskList(id);
              if (success) {
                  await fetchTaskListData();
              } else {
                  setError('Не удалось снять с публикации.');
              }
          } catch (err) {
              console.error('Ошибка при снятии с публикации:', err);
              setError('Ошибка при снятии с публикации.');
          } finally {
              setLoading(false);
          }
      }
  };

  const renderPublicationStatus = () => {
    if (!isOwner) {
      if (publicationStatus === 'Published') {
         return <Chip label="Опубликовано" color="info" size="small" />;
      }
      return null;
    }

    switch (publicationStatus) {
      case 'Pending':
        return <Chip label="На модерации" color="warning" size="small" />;
      case 'Published':
        return <Chip label="Опубликовано" color="info" size="small" onClick={handleUnpublish} />;
      case 'Rejected':
        return (
          <Tooltip title={rejectionReason || 'Причина отклонения не указана'} arrow>
            <Chip label="Отклонено" color="error" size="small" />
          </Tooltip>
        );
      case 'None':
      default:
        return (
          <Button
            variant="outlined"
            size="small"
            startIcon={<PublishIcon />}
            onClick={handlePublishRequest}
            disabled={loading}
          >
            Опубликовать
          </Button>
        );
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
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Box flexGrow={1} mr={2}>
            <Typography variant="h4" component="h1" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {description}
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2" color="text.secondary">
                Очки: {tasks.reduce((sum, task) => sum + (task.points || 0), 0)} / {tasks.reduce((sum, task) => sum + (task.requiredPoints || 0), 0)}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <LocalFireDepartmentIcon sx={{ 
                  color: streak > 100 ? 'purple' : streak > 0 ? 'orange' : 'grey.400',
                  fontSize: '1.2rem'
                }} />
                <Typography variant="body2" color={streak > 0 ? 'text.secondary' : 'text.disabled'}>
                  {streak || 0} дней
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
            {renderPublicationStatus()}
            <Box display="flex" gap={1}>
                {isOwner && (
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenTaskDialog()}
                    >
                        Добавить задачу
                    </Button>
                )}
                <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<BarChartIcon />}
                    component={Link}
                    to={`/analytics/${id}`}
                >
                    Аналитика
                </Button>
            </Box>
            {isOwner && (
                <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    component={Link}
                    to={`/edit-task-list/${id}`}
                    startIcon={<EditIcon />}
                    sx={{ mt: 1 }}
                >
                    Редактировать список
                </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <List>
        {tasks.map((task) => {
            // Логика для отображения изображения задачи
            let taskImageSrc = null;
            if (task.imageData && task.imageMimeType) {
                taskImageSrc = `data:${task.imageMimeType};base64,${task.imageData}`;
            } else if (task.imageData) { // Fallback
                taskImageSrc = `data:image/jpeg;base64,${task.imageData}`;
            }

            return (
                <React.Fragment key={task.id}>
                    <ListItem sx={{ display: 'block', p: 0 }}>
                        <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                            {taskImageSrc && (
                                <Box 
                                    component="img"
                                    src={taskImageSrc}
                                    alt={task.title}
                                    sx={{ 
                                        width: '100%', 
                                        height: '200px',
                                        objectFit: 'cover', 
                                        borderRadius: 1,
                                        display: 'block',
                                        mb: 2 
                                    }}
                                />
                            )}
                            
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography 
                                        variant="h6" 
                                        component="div" 
                                        sx={{ 
                                            fontWeight: 'medium', 
                                            textDecoration: task.completed ? 'line-through' : 'none',
                                            color: task.completed ? 'text.secondary' : 'text.primary'
                                        }}
                                    >
                                        {task.title}
                                    </Typography>
                                    {isOwner && (
                                        <Box>
                                            <IconButton
                                                aria-label="edit"
                                                onClick={() => handleOpenTaskDialog(task)}
                                                size="small"
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                aria-label="delete"
                                                onClick={() => handleDeleteTask(task.id)}
                                                size="small"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    )}
                                </Box>

                                {task.description && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {task.description}
                                    </Typography>
                                )}

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}> 
                                    <Checkbox
                                        checked={task.completed}
                                        onChange={() => handleTaskCompletion(task.id)}
                                        icon={<RadioButtonUncheckedIcon />}
                                        checkedIcon={<CheckCircleIcon />}
                                        size="small"
                                        sx={{ p: 0.5, mr: 1 }} 
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        {task.completed ? 'Выполнено' : 'Отметить как выполненное'}
                                    </Typography>
                                </Box>

                                <Box display="flex" gap={1} flexWrap="wrap">
                                    {task.dueDate && (
                                        <Chip
                                        label={new Date(task.dueDate).toLocaleDateString()}
                                        variant="outlined"
                                        size="small"
                                        />
                                    )}
                                    {task.points > 0 && (
                                        <Chip
                                        label={`${task.points} баллов`}
                                        color="primary"
                                        size="small"
                                        />
                                    )}
                                    {task.isPenalty && (
                                        <Chip
                                        label="Штраф"
                                        color="error"
                                        size="small"
                                        />
                                    )}
                                </Box>
                            </Box>
                        </Paper>
                    </ListItem>
                </React.Fragment>
            );
        })}
      </List>

      <Dialog open={openTaskDialog} onClose={handleCloseTaskDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTask ? 'Редактировать задачу' : 'Создать задачу'}</DialogTitle>
        <DialogContent>
            <TextField
                fullWidth
                label="Название"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                margin="normal"
            />
            <TextField
                fullWidth
                label="Описание"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                margin="normal"
                multiline
                rows={3}
            />
            <FormControl fullWidth margin="normal">
                <InputLabel>Тип задачи</InputLabel>
                <Select
                    value={taskForm.isPenalty ? 'penalty' : 'regular'}
                    onChange={(e) => setTaskForm({ ...taskForm, isPenalty: e.target.value === 'penalty' })}
                    label="Тип задачи"
                >
                    <MenuItem value="regular">Обычная задача</MenuItem>
                    <MenuItem value="penalty">Штраф</MenuItem>
                </Select>
            </FormControl>
            <TextField
                fullWidth
                label="Очки"
                type="number"
                value={taskForm.points}
                onChange={(e) => setTaskForm({ ...taskForm, points: parseInt(e.target.value) || 0 })}
                margin="normal"
                inputProps={{ min: 0 }}
                required
            />
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                <DatePicker
                    label="Срок выполнения"
                    value={taskForm.dueDate}
                    onChange={(newValue) => setTaskForm({ ...taskForm, dueDate: newValue })}
                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                />
            </LocalizationProvider>

            {/* Поле для загрузки изображения задачи */}
            <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                    Изображение задачи (необязательно)
                </Typography>
                {taskImagePreviewUrl && (
                    <Box sx={{ mb: 2, textAlign: 'center' }}>
                        <img src={taskImagePreviewUrl} alt="Предпросмотр" style={{ maxWidth: '100%', maxHeight: '150px' }} />
                    </Box>
                )}
                <Input
                    type="file"
                    onChange={handleTaskFileChange}
                    fullWidth
                    inputProps={{ accept: "image/jpeg, image/png, image/gif" }}
                />
            </Box>

        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTaskDialog}>Отмена</Button>
          <Button onClick={handleTaskSubmit} variant="contained">
            {editingTask ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskList; 