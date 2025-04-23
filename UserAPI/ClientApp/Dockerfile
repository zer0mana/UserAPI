FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install date-fns
RUN npm install react-chartjs-2
RUN npm install chart.js
RUN npm install @mui/material
RUN npm install react-calendar-heatmap

COPY . .

EXPOSE 3006

CMD ["npm", "start"]