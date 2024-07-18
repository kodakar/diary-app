import React, { useState } from 'react';
import { createDiary, DiaryEntry } from '../../services/api';

interface DiaryFormProps {
  onDiaryCreated: (diary: DiaryEntry) => void;
}

const DiaryForm: React.FC<DiaryFormProps> = ({ onDiaryCreated }) => {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newDiary = await createDiary(content, mood);
      onDiaryCreated(newDiary);
      setContent('');
      setMood('');
      setError('');
    } catch (err) {
      setError('日記の作成に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="今日はどんな一日でしたか？"
        required
      />
      <input
        type="text"
        value={mood}
        onChange={(e) => setMood(e.target.value)}
        placeholder="今の気分は？"
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? '保存中...' : '日記を保存'}
      </button>
    </form>
  );
};

export default DiaryForm;