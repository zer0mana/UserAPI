import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import taskService from '../services/taskService';

const CreateTaskList = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      console.log('Creating task list with:', { title, description });
      const taskList = await taskService.createTaskList(title, description);
      console.log('Task list created:', taskList);
      navigate('/');
    } catch (err) {
      console.error('Error creating task list:', err);
      setError('Не удалось создать список задач. Пожалуйста, попробуйте позже.');
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