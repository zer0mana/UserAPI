import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

const TaskHeatmap = ({ data }) => {
  const today = new Date();
  const lastYear = new Date(today);
  lastYear.setFullYear(today.getFullYear() - 1);

  return (
    <>
      <style>
        {`
          .react-calendar-heatmap .color-empty {
            fill: #eeeeee;
          }
          .react-calendar-heatmap .color-github-1 {
            fill: rgb(75, 192, 192);
          }
          /* Add more classes for different levels if needed */
        `}
      </style>
      <CalendarHeatmap
        startDate={lastYear}
        endDate={today}
        values={data}
        classForValue={(value) => {
          if (!value || value.count === 0) {
            return 'color-empty';
          }
          // Example: More tasks = darker color (adjust classes and logic as needed)
          return 'color-github-1';
        }}
        tooltipDataAttrs={value => {
          if (!value || !value.date) {
            return null;
          }
          return {
            'data-tip': `${new Date(value.date).toLocaleDateString()}: ${value.count || 0} tasks`,
          };
        }}
        showWeekdayLabels
        transformDayElement={(rect, value) => {
          if (value && value.count) {
            return rect;
          }
          return rect;
        }}
      />
    </>
  );
};

export default TaskHeatmap; 