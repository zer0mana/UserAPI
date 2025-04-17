import axios from 'axios';
import authService from './authService';

// Используем относительный путь для API
const API_URL = '/api';

// Создаем экземпляр axios с перехватчиком для добавления токена
const api = axios.create({
    baseURL: API_URL
});

// Добавляем перехватчик для обработки ошибок
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Если получаем 401, значит токен истек или недействителен
            authService.logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

api.interceptors.request.use(
    (config) => {
        const token = authService.getToken();
        console.log('Current token:', token);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Request headers:', config.headers);
        } else {
            console.warn('No token found in localStorage');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

class TaskService {
    async getTaskLists() {
        try {
            const response = await api.get('/todotask/lists');
            console.log('Ответ от сервера при получении списков задач:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching task lists:', error);
            throw error;
        }
    }

    async getTaskList(taskListId) {
        try {
            const response = await api.get(`/todotask/lists/${taskListId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching task list ${taskListId}:`, error);
            throw error;
        }
    }

    async getRecommendedTaskLists() {
        try {
            const response = await api.get('/todotask/lists/recommended');
            console.log('Ответ от сервера при загрузке рекомендуемых списков:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching recommended task lists:', error);
            throw error;
        }
    }

    async createTaskList(title, description, requiredPoints) {
        try {
            console.log('Creating task list with:', { title, description, requiredPoints });
            const response = await api.post('/todotask/lists', {
                title,
                description,
                requiredPoints
            });
            console.log('Task list created:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating task list:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            throw error;
        }
    }

    async updateTaskList(taskListId, title, description, requiredPoints) {
        try {
            const response = await api.put(`/todotask/lists/${taskListId}`, {
                title,
                description,
                requiredPoints
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating task list ${taskListId}:`, error);
            throw error;
        }
    }

    async deleteTaskList(taskListId) {
        try {
            await api.delete(`/todotask/lists/${taskListId}`);
        } catch (error) {
            console.error(`Error deleting task list ${taskListId}:`, error);
            throw error;
        }
    }

    async getTasks(taskListId) {
        try {
            const response = await api.get(`/todotask/lists/${taskListId}/tasks`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching tasks from list ${taskListId}:`, error);
            throw error;
        }
    }

    async createTask(taskListId, title, description, priority, dueDate, points) {
        try {
            const response = await api.post(`/todotask/lists/${taskListId}/tasks`, {
                title,
                description,
                priority,
                dueDate,
                points
            });
            return response.data;
        } catch (error) {
            console.error(`Error creating task in list ${taskListId}:`, error);
            throw error;
        }
    }

    async updateTask(taskListId, taskId, title, description, completed, priority, dueDate, points) {
        try {
            const response = await api.put(`/todotask/lists/${taskListId}/tasks/${taskId}`, {
                title,
                description,
                completed,
                priority,
                dueDate,
                points
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating task ${taskId} in list ${taskListId}:`, error);
            throw error;
        }
    }

    async deleteTask(taskListId, taskId) {
        try {
            await api.delete(`/todotask/lists/${taskListId}/tasks/${taskId}`);
        } catch (error) {
            console.error(`Error deleting task ${taskId} from list ${taskListId}:`, error);
            throw error;
        }
    }

    async markTaskCompleted(taskListId, taskId) {
        try {
            const response = await api.put(`/todotask/lists/${taskListId}/tasks/${taskId}/complete`);
            return response.data;
        } catch (error) {
            console.error(`Error marking task ${taskId} as completed in list ${taskListId}:`, error);
            throw error;
        }
    }

    async subscribeToTaskList(taskListId) {
        try {
            console.log('Подписка на список задач:', taskListId);
            const response = await api.put(`/todotask/lists/${taskListId}/subscribe`);
            console.log('Ответ от сервера при подписке:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error subscribing to task list:', error);
            throw error;
        }
    }

    async searchTaskLists(query) {
        try {
            console.log('Поиск списков задач:', query);
            const response = await api.get(`/todotask/lists/search?query=${encodeURIComponent(query)}`);
            console.log('Сырой ответ от сервера:', response);
            console.log('Данные ответа:', response.data);
            // Проверяем, что response.data - это массив
            if (!Array.isArray(response.data)) {
                console.warn('Ответ от сервера не является массивом:', response.data);
                return [];
            }
            return response.data;
        } catch (error) {
            console.error('Ошибка при поиске списков задач:', error);
            if (error.response) {
                console.error('Данные ответа:', error.response.data);
                console.error('Статус ответа:', error.response.status);
            }
            throw error;
        }
    }

    async getTaskAnalytics() {
        try {
            const response = await api.get('/todotask/analytics');
            console.log('Ответ от сервера при получении аналитики:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching analytics:', error);
            throw error;
        }
    }
}

export default new TaskService(); 