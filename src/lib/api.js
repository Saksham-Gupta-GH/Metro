import api from '../services/api';

export async function apiRequest(path, options = {}) {
  try {
    const response = await api({
      url: path,
      method: options.method || 'get',
      data: options.body ? JSON.parse(options.body) : options.data,
      headers: options.headers || {},
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Request failed.');
  }
}
