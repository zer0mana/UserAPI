import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateTaskList = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Начало создания списка задач');

    try {
      const userId = localStorage.getItem('userId');
      console.log('Получен userId из localStorage:', userId);
      
      if (!userId) {
        console.error('userId не найден в localStorage');
        setError('Пользователь не авторизован');
        return;
      }

      const requestData = {
        title: title,
        description: description
      };

      console.log('Подготовленные данные для отправки:', requestData);
      console.log('URL запроса:', `/pyd-user-api-handler/create-pyd?userId=${userId}`);

      const response = await axios.post(`/pyd-user-api-handler/create-pyd?userId=${userId}`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Ответ от сервера:', response.data);

      if (response.data) {
        console.log('Список задач успешно создан, перенаправление на /');
        navigate('/');
      }
    } catch (err) {
      console.error('Ошибка при создании списка задач:', err);
      console.error('Детали ошибки:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        headers: err.response?.headers,
        config: err.config
      });
      setError(err.response?.data?.message || 'Не удалось создать список задач. Пожалуйста, попробуйте позже.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Создать новый список задач</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Название</label>
          <input
            type="text"
            className="form-control"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Описание</label>
          <textarea
            className="form-control"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
          />
        </div>
        <button type="submit" className="btn btn-primary">Создать</button>
      </form>
    </div>
  );
};

export default CreateTaskList; 