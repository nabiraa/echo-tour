import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

export const artistAPI = {
  getAll: (params) => api.get('/artists', { params }),
  getById: (id) => api.get(`/artists/${id}`),
  create: (data) => api.post('/artists', data),
  update: (id, data) => api.put(`/artists/${id}`, data),
  delete: (id) => api.delete(`/artists/${id}`),
};

export const concertAPI = {
  getAll: (params) => api.get('/concerts', { params }),
  getById: (id) => api.get(`/concerts/${id}`),
  create: (data) => api.post('/concerts', data),
  update: (id, data) => api.put(`/concerts/${id}`, data),
  delete: (id) => api.delete(`/concerts/${id}`),
  getRevenuePerTour: () => api.get('/concerts/analytics/revenue-per-tour'),
  getAttendanceByCountry: () => api.get('/concerts/analytics/attendance-by-country'),
  getMonthlyRevenue: () => api.get('/concerts/analytics/monthly-revenue'),
};

export const ticketAPI = {
  getAll: (params) => api.get('/tickets', { params }),
  getByRef: (ref) => api.get(`/tickets/ref/${ref}`),
  book: (data) => api.post('/tickets/book', data),
  cancel: (id) => api.put(`/tickets/${id}/cancel`),
  checkIn: (id) => api.put(`/tickets/${id}/checkin`),
};

export const venueAPI = {
  getAll: (params) => api.get('/venues', { params }),
  getById: (id) => api.get(`/venues/${id}`),
  create: (data) => api.post('/venues', data),
  update: (id, data) => api.put(`/venues/${id}`, data),
  delete: (id) => api.delete(`/venues/${id}`),
};

export const staffAPI = {
  getAll: (params) => api.get('/staff', { params }),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
};

export default api;
