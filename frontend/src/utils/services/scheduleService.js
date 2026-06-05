// utils/services/scheduleService.js
import api from '@/api';

export const getSchedule = async () => {
  const response = await api.get('/schedule/');
  return response.data;
};