import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { Button, Box } from '@mui/material';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await authService.login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при входе');
        }
    };

    return (
        <div className="auth-container">
            <h2>Вход</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Пароль:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                    <button type="submit">Войти</button>
                    <Button
                        component={Link}
                        to="/reset-password"
                        variant="text"
                        sx={{ textTransform: 'none' }}
                    >
                        Восстановить пароль
                    </Button>
                </Box>
            </form>
        </div>
    );
};

export default Login; 