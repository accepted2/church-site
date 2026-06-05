// utils/services/ZapiskaService.js
import api from '@/api';

export const getTrebaTypes = async () => {
  const response = await api.get('/treby/types/');
  return response.data;
};

export const createTrebaOrder = async (orderData) => {
  const response = await api.post('/treby/orders/', orderData);
  return response.data;
};

export const getTrebaOrderById = async (id) => {
  const response = await api.get(`/treby/orders/${id}/`);
  return response.data;
};

export const getTrebaOrderByUuid = async (uuid) => {
  const response = await api.get(`/treby/orders/by-uuid/${uuid}/`);
  return response.data;
};

export const checkOrderStatus = async (identifier, type = 'id') => {
  if (type === 'uuid') {
    return getTrebaOrderByUuid(identifier);
  }
  return getTrebaOrderById(identifier);
};