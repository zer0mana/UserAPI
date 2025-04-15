import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper
} from '@mui/material';
import taskService from '../services/taskService';

const CreateTaskList = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [requiredPoints, setRequiredPoints] = useState(0);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log('Создание списка задач с очками:', requiredPoints);
            await taskService.createTaskList(title, description, requiredPoints);
            navigate('/');
        } catch (error) {
            console.error('Ошибка при создании списка задач:', error);
            alert('Не удалось создать список задач');
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" component="h1" gutterBottom>
                    Создать новый список задач
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Название"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                        required
                        margin="normal"
                    />
                    <TextField
                        label="Описание"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        rows={4}
                        margin="normal"
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
                    <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/')}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                        >
                            Создать
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default CreateTaskList; 