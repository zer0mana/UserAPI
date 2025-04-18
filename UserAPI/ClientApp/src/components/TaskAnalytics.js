import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import taskService from '../services/taskService';

// Регистрируем компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TaskAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await taskService.getTaskAnalytics();
        console.log('Данные аналитики:', response);
        setAnalyticsData(response);
        setLoading(false);
      } catch (err) {
        console.error('Ошибка при загрузке аналитики:', err);
        setError('Не удалось загрузить данные аналитики. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Подготавливаем данные для графика
  const chartData = {
    labels: analyticsData?.dailyPoints?.map(item => 
      new Date(item.date).toLocaleDateString('ru-RU', { 
        day: '2-digit',
        month: '2-digit'
      })
    ) || [],
    datasets: [
      {
        label: 'Очки за день',
        data: analyticsData?.dailyPoints?.map(item => item.points) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Динамика очков по дням'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Очки'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Дата'
        }
      }
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Аналитика
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Общая статистика
              </Typography>
              <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Всего очков
                  </Typography>
                  <Typography variant="h4">
                    {analyticsData?.totalPoints || 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Среднее за день
                  </Typography>
                  <Typography variant="h4">
                    {analyticsData?.averagePointsPerDay?.toFixed(1) || 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Максимум за день
                  </Typography>
                  <Typography variant="h4">
                    {analyticsData?.maxPointsPerDay || 0}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Всего задач
                  </Typography>
                  <Typography variant="h4">
                    {analyticsData?.totalTasks || 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Выполненные задачи
                  </Typography>
                  <Typography variant="h4">
                    {analyticsData?.completedTasks || 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Ожидающие задачи
                  </Typography>
                  <Typography variant="h4">
                    {analyticsData?.pendingTasks || 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Просроченные задачи
                  </Typography>
                  <Typography variant="h4">
                    {analyticsData?.overdueTasks || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Line data={chartData} options={chartOptions} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskAnalytics; 