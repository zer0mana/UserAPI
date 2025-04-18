import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Input
} from '@mui/material';
import taskService from '../services/taskService';

const CreateTaskList = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [requiredPoints, setRequiredPoints] = useState(0);
    const [imageFile, setImageFile] = useState(null);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log('Создание списка задач с очками:', requiredPoints);
            
            const formData = new FormData();
            formData.append('Title', title);
            formData.append('Description', description);
            formData.append('RequiredPoints', requiredPoints.toString());
            if (imageFile) {
                formData.append('ImageFile', imageFile);
            }

            await taskService.createTaskList(formData);
            navigate('/');
        } catch (error) {
            console.error('Ошибка при создании списка задач:', error);
            alert('Не удалось создать список задач');
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 3 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Создать новый список задач
                </Typography>
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
                                console.log('Изменение очков:', value);
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
                            Изображение (необязательно)
                        </Typography>
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
                    >
                        Создать список
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default CreateTaskList; 