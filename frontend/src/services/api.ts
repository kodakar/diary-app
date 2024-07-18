import axios from 'axios';

const API_URL = 'http://localhost:3001/api'; // バックエンドのURL

export const login = async (email: string, password: string) => {
  try {
    console.log('ログインリクエスト送信:', { email, password: '********' });
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    console.log('ログインレスポンス:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('ログインエラー:', error.response?.data);
    console.error('完全なエラーオブジェクト:', error);
    throw error;
  }
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
// 既存のインポートと設定はそのままにしてください

// 日記エントリーの型定義
export interface DiaryEntry {
  _id: string;
  content: string;
  mood?: string;
  aiAnalysis: {
    generalComment: string;
    positiveAspects: string[];
    improvementSuggestions: string[];
    overallScore: number;
  };
  createdAt: string;
  updatedAt: string;
}

export const createDiary = async (content: string, mood: string): Promise<DiaryEntry> => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post<DiaryEntry>(`${API_URL}/diaries`, { content, mood }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Create diary error:', error);
    throw error;
  }
};

export const getDiaries = async (): Promise<DiaryEntry[]> => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get<DiaryEntry[]>(`${API_URL}/diaries`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Get diaries error:', error);
    throw error;
  }
};

export const getDiary = async (id: string): Promise<DiaryEntry> => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get<DiaryEntry>(`${API_URL}/diaries/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Get diary error:', error);
    throw error;
  }
};

export const updateDiary = async (id: string, content: string, mood: string): Promise<DiaryEntry> => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.put<DiaryEntry>(`${API_URL}/diaries/${id}`, { content, mood }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Update diary error:', error);
    throw error;
  }
};

export const deleteDiary = async (id: string): Promise<void> => {
  const token = localStorage.getItem('token');
  try {
    await axios.delete(`${API_URL}/diaries/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error('Delete diary error:', error);
    throw error;
  }
};