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
    Input,
    Grid,
    Stack
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { ru } from 'date-fns/locale';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import taskService from '../services/taskService';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import authService from '../services/authService';
import PublishIcon from '@mui/icons-material/Publish';
import UnpublishedIcon from '@mui/icons-material/Unpublished';
import CloseIcon from '@mui/icons-material/Close';
import TaskAnalytics from './TaskAnalytics';

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
    const [earnedPoints, setEarnedPoints] = useState(0);
    const [requiredPoints, setRequiredPoints] = useState(0);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [analyticsData, setAnalyticsData] = useState(null);

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
    const [listImageData, setListImageData] = useState(null);
    const [listImageMimeType, setListImageMimeType] = useState(null);

    const fetchTaskListData = async () => {
        try {
            setLoading(true);
            const response = await taskService.getTaskList(id);
            console.log('Обновленные данные списка задач:', response);
            console.log('Значение streak:', response.streak);
            setTitle(response.title);
            setDescription(response.description || '');
            setTasks(response.toDoTasks || []);
            setStreak(response.streak || 0);
            setEarnedPoints(response.earnedPoints || 0);
            setRequiredPoints(response.requiredPoints || 0);
            setPublicationStatus(response.publicationStatus || "None");
            setRejectionReason(response.rejectionReason || null);
            setListImageData(response.imageData);
            setListImageMimeType(response.imageMimeType);

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
        if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
            try {
                await taskService.deleteTask(id, taskId);
                // Обновляем список задач
                const response = await taskService.getTaskList(id);
                setTasks(response.toDoTasks || []);
            } catch (err) {
                console.error('Ошибка при удалении задачи:', err);
                setError('Не удалось удалить задачу. Пожалуйста, попробуйте позже.');
            }
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

    const getPriorityChip = (priority) => {
        let color = 'default';
        let label = priority || 'Средний';
        switch (priority?.toLowerCase()) {
            case 'high':
                color = 'error';
                label = 'Высокий';
                break;
            case 'medium':
                color = 'warning';
                label = 'Средний';
                break;
            case 'low':
                color = 'info';
                label = 'Низкий';
                break;
            default:
                color = 'default';
                break;
        }
        return <Chip label={label} color={color} size="small" icon={<PriorityHighIcon />} />;
    };

    const formatDate = (dateString) => {
        if (!dateString) return null;
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return null;
            }
            return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch (error) {
            console.error("Error formatting date:", dateString, error);
            return null;
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
        let chipProps = {};
        let isClickable = false;
        let tooltipTitle = null;

        switch (publicationStatus) {
            case 'Published':
                chipProps = { label: 'Опубликовано', color: 'success', icon: <PublishIcon /> };
                isClickable = true; // Делаем кликабельным для снятия
                tooltipTitle = 'Нажмите, чтобы снять с публикации';
                break;
            case 'Pending':
                chipProps = { label: 'На модерации', color: 'warning', icon: <CircularProgress size={16} sx={{ mr: 1 }} /> };
                tooltipTitle = 'Список ожидает проверки модератором';
                break;
            case 'Rejected':
                chipProps = { label: 'Отклонено', color: 'error', icon: <UnpublishedIcon /> };
                tooltipTitle = `Причина отклонения: ${rejectionReason || 'не указана'}`;
                break;
            default: // None или другой статус
                chipProps = { label: 'Не опубликовано', color: 'default', icon: <UnpublishedIcon /> };
                tooltipTitle = 'Этот список виден только вам';
                break;
        }

        const chipElement = (
            <Chip
                {...chipProps}
                size="medium"
                onClick={isClickable ? handleUnpublish : undefined} // Добавляем onClick
                sx={{ cursor: isClickable ? 'pointer' : 'default' }} // Меняем курсор
            />
        );

        // Оборачиваем в Tooltip всегда
        return (
            <Tooltip title={tooltipTitle} arrow>
                {/* Оборачиваем в span, чтобы Tooltip работал на disabled/некликабельных элементах */}
                <span> 
          {chipElement}
        </span>
            </Tooltip>
        );
    };

    const handleAnalytics = async () => {
        try {
            const data = await taskService.getTaskAnalytics(id);
            setAnalyticsData(data);
            setShowAnalytics(true);
        } catch (err) {
            console.error('Ошибка при получении аналитики:', err);
            setError('Не удалось загрузить аналитику. Пожалуйста, попробуйте позже.');
        }
    };

    if (loading) {
        return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
    }

    return (
        <Box sx={{ mt: 4, p: 3 }}>
            <Paper elevation={2} sx={{
                mb: 4,
                overflow: 'hidden',
                maxWidth: 1200,
                mx: 'auto',
                width: 800, // Фиксированная высота всей карточки
                height: 440, // Фиксированная высота всей карточки
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Box sx={{
                    position: 'relative',
                    width: '100%',
                    height: 250, // Уменьшаем высоту для фотографии
                    flexShrink: 0,
                    backgroundColor: 'grey.200'
                }}>
                    {listImageData && (
                        <Box
                            component="img"
                            src={`data:${listImageMimeType || 'image/jpeg'};base64,${listImageData}`}
                            alt={title}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block'
                            }}
                        />
                    )}
                    {/* Огонек и другие элементы поверх изображения */}
                    {streak !== undefined && streak !== null && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 16,
                                left: 16,
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                borderRadius: '16px',
                                padding: '8px 16px',
                                color: 'white',
                                gap: '8px'
                            }}
                        >
                            <LocalFireDepartmentIcon
                                sx={{
                                    fontSize: '2rem',
                                    color: streak > 100 ? '#BA68C8' : streak > 0 ? 'orange' : 'white',
                                    ...(streak > 0 && {
                                        '@keyframes flame': {
                                            '0%': {
                                                transform: 'rotate(-2deg) scale(1)',
                                                filter: 'brightness(1) drop-shadow(0 0 8px rgba(255, 165, 0, 0.6))',
                                            },
                                            '25%': {
                                                transform: 'rotate(3deg) scale(1.05)',
                                                filter: 'brightness(1.1) drop-shadow(0 0 10px rgba(255, 165, 0, 0.7))',
                                            },
                                            '50%': {
                                                transform: 'rotate(-1deg) scale(1.1)',
                                                filter: 'brightness(1.2) drop-shadow(0 0 12px rgba(255, 165, 0, 0.8))',
                                            },
                                            '75%': {
                                                transform: 'rotate(2deg) scale(1.05)',
                                                filter: 'brightness(1.1) drop-shadow(0 0 10px rgba(255, 165, 0, 0.7))',
                                            },
                                            '100%': {
                                                transform: 'rotate(-2deg) scale(1)',
                                                filter: 'brightness(1) drop-shadow(0 0 8px rgba(255, 165, 0, 0.6))',
                                            }
                                        },
                                        animation: 'flame 2s infinite ease-in-out',
                                        transformOrigin: 'center bottom',
                                    })
                                }}
                            />
                            <Typography
                                variant="h6"
                                sx={{
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '1.5rem'
                                }}
                            >
                                {streak || 0}
                            </Typography>
                        </Box>
                    )}
                    {/* Прогресс очков справа */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            borderRadius: '16px',
                            padding: '8px 16px',
                            color: 'white',
                        }}
                    >
                        {earnedPoints >= requiredPoints ? (
                            <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                                Выполнено
                            </Typography>
                        ) : (
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                                {earnedPoints} / {requiredPoints}
                            </Typography>
                        )}
                    </Box>
                </Box>
                <Box sx={{
                    p: 4,
                    height: 400, // Фиксированная высота для контента
                    overflow: 'auto' // Добавляем скролл если контент не помещается
                }}>
                    <Grid container spacing={3} alignItems="flex-start">
                        <Grid item xs={12} md={10}>
                            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                                {title}
                            </Typography>
                            {description && (
                                <Typography variant="h6" color="text.secondary" paragraph sx={{ mt: 2 }}>
                                    {description}
                                </Typography>
                            )}
                        </Grid>

                        <Grid item xs={12} md={2}>
                            <Stack spacing={1.5} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
                                {isOwner && renderPublicationStatus()}

                                {isOwner && (
                                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                        {publicationStatus !== 'Published' && publicationStatus !== 'Pending' && (
                                            <Tooltip title="Отправить на публикацию">
                                                <IconButton onClick={handlePublishRequest} size="medium" color="primary">
                                                    <PublishIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <Tooltip title="Добавить Задачу">
                                            <IconButton onClick={() => handleOpenTaskDialog()} size="medium" color="primary">
                                                <AddIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Аналитика">
                                            <IconButton onClick={handleAnalytics} size="medium">
                                                <BarChartIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Редактировать Список">
                                            <IconButton component={Link} to={`/edit-task-list/${id}`} size="medium" color="secondary">
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                )}
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>

            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
                Задачи
            </Typography>

            {tasks.length === 0 ? (
                <Typography color="text.secondary">В этом списке пока нет задач.</Typography>
            ) : (
                <List sx={{ width: '100%' }}>
                    {tasks.map((task) => {
                        let taskImageSrc = null;
                        if (task.imageData && task.imageMimeType) {
                            taskImageSrc = `data:${task.imageMimeType};base64,${task.imageData}`;
                        } else if (task.imageData) { // Fallback
                            taskImageSrc = `data:image/jpeg;base64,${task.imageData}`;
                        }

                        return (
                            <Box key={task.id} sx={{ mb: 3 }}>
                                {taskImageSrc && (
                                    <Box sx={{ position: 'relative' }}>
                                        <Box
                                            component="img"
                                            src={taskImageSrc}
                                            alt={task.title}
                                            sx={{
                                                width: '100%',
                                                height: 250,
                                                objectFit: 'cover',
                                                borderTopLeftRadius: (theme) => theme.shape.borderRadius,
                                                borderTopRightRadius: (theme) => theme.shape.borderRadius,
                                                display: 'block',
                                                mb: 0
                                            }}
                                        />
                                    </Box>
                                )}

                                <Paper elevation={1} sx={{
                                    borderTopLeftRadius: taskImageSrc ? 0 : undefined,
                                    borderTopRightRadius: taskImageSrc ? 0 : undefined
                                }}>
                                    <ListItem sx={{ py: 1.5 }}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            backgroundColor: task.isCompleted ? 'rgba(76, 175, 80, 0.1)' : undefined,
                                            borderRadius: '12px',
                                            padding: '4px 12px',
                                            flex: 1
                                        }}>
                                            <Checkbox
                                                checked={task.isCompleted}
                                                onChange={() => handleTaskCompletion(task.id)}
                                                icon={<RadioButtonUncheckedIcon />}
                                                checkedIcon={<CheckCircleIcon color="success" />}
                                                edge="start"
                                                sx={{ mr: 1 }}
                                            />
                                            <Box sx={{ flex: 1 }}>
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Typography
                                                                sx={{
                                                                    textDecoration: task.isCompleted ? 'line-through' : 'none',
                                                                    color: task.isCompleted ? 'text.disabled' : 'inherit',
                                                                    opacity: task.isCompleted ? 0.7 : 1
                                                                }}
                                                            >
                                                                {task.title}
                                                            </Typography>
                                                            <Chip
                                                                label={`${task.isPenalty ? '-' : '+'} ${task.points} очков`}
                                                                size="small"
                                                                color={task.isPenalty ? "error" : "success"}
                                                            />
                                                        </Box>
                                                    }
                                                    secondary={task.description || null}
                                                />
                                            </Box>
                                        </Box>
                                        {isOwner && (
                                            <ListItemSecondaryAction>
                                                <Tooltip title="Редактировать задачу">
                                                    <IconButton edge="end" aria-label="edit" onClick={() => handleOpenTaskDialog(task)} size="small">
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Удалить задачу">
                                                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTask(task.id)} size="small" sx={{ ml: 0.5 }}>
                                                        <DeleteIcon fontSize="small" color="error"/>
                                                    </IconButton>
                                                </Tooltip>
                                            </ListItemSecondaryAction>
                                        )}
                                    </ListItem>
                                </Paper>
                            </Box>
                        );
                    })}
                </List>
            )}

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

            {/* Диалог с аналитикой */}
            <Dialog
                open={showAnalytics}
                onClose={() => setShowAnalytics(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Аналитика списка задач
                    <IconButton
                        aria-label="close"
                        onClick={() => setShowAnalytics(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {analyticsData ? (
                        <TaskAnalytics analyticsData={analyticsData} />
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default TaskList; 