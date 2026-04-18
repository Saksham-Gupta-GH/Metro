import axios from 'axios';

function getStoredUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return JSON.parse(localStorage.getItem('metroUser') || 'null');
  } catch (error) {
    return null;
  }
}

const api = axios.create({
  baseURL: '',
});

api.interceptors.request.use((config) => {
  const user = getStoredUser();

  if (user?.email) {
    config.headers['x-user-email'] = user.email;
  }

  if (user?.role) {
    config.headers['x-user-role'] = user.role;
  }

  return config;
});

export default api;
