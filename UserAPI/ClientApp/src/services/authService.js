import axios from 'axios';

// Используем относительный путь для API
const API_URL = '/api';

// Создаем экземпляр axios с базовой конфигурацией
const api = axios.create({
    baseURL: API_URL
});

// Добавляем перехватчик для обработки ошибок
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Если получаем 401, значит токен истек или недействителен
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

class AuthService {
    async register(email, password, firstName, lastName) {
        try {
            const response = await api.post('/auth/register', {
                email,
                password,
                firstName,
                lastName
            });
            if (response.data.token) {
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            return response.data;
        } catch (error) {
            console.error('Error during registration:', error);
            throw error;
        }
    }

    async login(email, password) {
        try {
            const response = await api.post('/auth/login', {
                email,
                password
            });
            if (response.data.token) {
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            return response.data;
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    }

    logout() {
        localStorage.removeItem('user');
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user');
            return null;
        }
    }

    getToken() {
        const user = this.getCurrentUser();
        return user?.token;
    }

    isAuthenticated() {
        return !!this.getToken();
    }
}

export default new AuthService(); 