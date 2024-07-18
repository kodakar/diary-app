import React, { useState, useEffect } from 'react';
import { getDiaries, DiaryEntry } from '../../services/api';

const DiaryList: React.FC = () => {
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDiaries();
  }, []);

  const fetchDiaries = async () => {
    try {
      const fetchedDiaries = await getDiaries();
      setDiaries(fetchedDiaries);
    } catch (err) {
      setError('日記の取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <p>読み込み中...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <h2>日記一覧</h2>
      {diaries.map((diary) => (
        <div key={diary._id} className="diary-entry">
          <h3>{new Date(diary.createdAt).toLocaleDateString()}</h3>
          <p><strong>内容:</strong> {diary.content}</p>
          {diary.mood && <p><strong>気分:</strong> {diary.mood}</p>}
          {diary.aiAnalysis && (
            <div className="ai-analysis">
              <h4>AI分析</h4>
              <p><strong>総評:</strong> {diary.aiAnalysis.generalComment}</p>
              <p><strong>ポジティブな点:</strong></p>
              <ul>
                {diary.aiAnalysis.positiveAspects.map((aspect, index) => (
                  <li key={index}>{aspect}</li>
                ))}
              </ul>
              <p><strong>改善提案:</strong></p>
              <ul>
                {diary.aiAnalysis.improvementSuggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
              <p><strong>総合スコア:</strong> {diary.aiAnalysis.overallScore}/10</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DiaryList;