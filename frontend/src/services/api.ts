import axios from 'axios';

const API_URL = 'http://localhost:3001/api'; // バックエンドのURL

export const login = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  return response.data;
};


export const register = async (username: string, email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, { username, email, password });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API error:', error.response?.data);
      throw error.response?.data || error;
    }
    throw error;
  }
};


// 他のAPI呼び出し関数をここに追加します