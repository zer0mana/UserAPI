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

      const response = await axios.post(`/pyd-user-api-handler/create-pyd?userId=${parseInt(userId, 10)}`, {
        title: title,
        description: description
      });
      console.log('Ответ сервера:', response.data);
      navigate('/');
    } catch (err) {
      console.error('Ошибка при создании списка задач:', err);
      if (err.response) {
        console.error('Детали ошибки:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
      }
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