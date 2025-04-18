import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper,
  CircularProgress,
  Alert,
  Input
} from '@mui/material';
import taskService from '../services/taskService';

// Функция для конвертации ArrayBuffer/Uint8Array в Base64
const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

const EditTaskList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredPoints, setRequiredPoints] = useState(0);
  const [currentImageData, setCurrentImageData] = useState(null); // Для текущего изображения с сервера
  const [imageFile, setImageFile] = useState(null); // Для нового выбранного файла
  const [imagePreviewUrl, setImagePreviewUrl] = useState(''); // Для предпросмотра
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTaskList = async () => {
      try {
        const response = await taskService.getTaskList(id);
        setTitle(response.title);
        setDescription(response.description || '');
        setRequiredPoints(response.requiredPoints || 0);
        if (response.imageData) {
            // Конвертируем byte[] в Base64 Data URL
            const base64String = arrayBufferToBase64(response.imageData);
            // Определяем тип контента (предполагаем jpeg, можно улучшить, если сервер передает mime type)
            // Для простоты пока оставим jpeg, но лучше хранить/передавать mime type
            const imageUrl = `data:image/jpeg;base64,${base64String}`;
            setCurrentImageData(imageUrl); 
            setImagePreviewUrl(imageUrl); // Показываем текущее изображение как превью
        }
        setLoading(false);
      } catch (err) {
        console.error('Ошибка при загрузке списка задач:', err);
        setError('Не удалось загрузить список задач. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    };

    fetchTaskList();
  }, [id]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Создаем URL для предпросмотра
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('Title', title);
      formData.append('Description', description);
      formData.append('RequiredPoints', requiredPoints.toString());
      if (imageFile) {
        formData.append('ImageFile', imageFile);
      }
      // Если изображение не менялось, старое значение imageData уже на сервере
      // Метод updateTaskList в сервисе нужно будет обновить для приема FormData
      await taskService.updateTaskList(id, formData); 
      navigate(`/task-list/${id}`);
    } catch (err) {
      console.error('Ошибка при обновлении списка задач:', err);
      setError('Не удалось обновить список задач. Пожалуйста, попробуйте позже.');
      setLoading(false);
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
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Редактировать список задач
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Название"
              name="title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              margin="normal"
              fullWidth
              id="description"
              label="Описание (необязательно)"
              name="description"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              border: '1px solid #1976d2', 
              borderRadius: 1,
              backgroundColor: '#f5f5f5'
            }}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Требуемое количество очков
              </Typography>
              <TextField
                label="Очки"
                type="number"
                value={requiredPoints}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setRequiredPoints(value);
                }}
                fullWidth
                required
                margin="normal"
                inputProps={{ min: 0 }}
                sx={{ 
                  '& .MuiInputLabel-root': { color: 'primary.main' },
                  '& .MuiOutlinedInput-root': { 
                    '&:hover fieldset': { borderColor: 'primary.main' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                  }
                }}
              />
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Изображение
              </Typography>
              {imagePreviewUrl && (
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                  <img src={imagePreviewUrl} alt="Предпросмотр" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                </Box>
              )}
              <Input
                type="file"
                onChange={handleFileChange}
                fullWidth
                inputProps={{ accept: "image/jpeg, image/png, image/gif" }}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading} 
            >
              {loading ? <CircularProgress size={24} /> : 'Сохранить изменения'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate(`/task-list/${id}`)}
              sx={{ mb: 2 }}
            >
              Отмена
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default EditTaskList; 