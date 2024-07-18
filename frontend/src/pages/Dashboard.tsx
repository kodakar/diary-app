import React, { useState } from 'react';
import DiaryForm from '../components/DiaryEntry/DiaryForm';
import DiaryList from '../components/DiaryEntry/DiaryList';
import { DiaryEntry } from '../services/api';

const Dashboard: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDiaryCreated = (newDiary: DiaryEntry) => {
    // 新しい日記が作成されたら、リストを更新するためにrefreshKeyを変更
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div>
      <h1>ダッシュボード</h1>
      <DiaryForm onDiaryCreated={handleDiaryCreated} />
      <DiaryList key={refreshKey} />
    </div>
  );
};

export default Dashboard;