import React from 'react';
import DiaryForm from '../components/DiaryEntry/DiaryForm';
import DiaryList from '../components/DiaryEntry/DiaryList';

const Dashboard: React.FC = () => {
  const mockEntries = [
    { id: '1', content: 'This is a sample entry', date: '2024-01-01' },
  ];

  return (
    <div>
      <h1>Your Dashboard</h1>
      <DiaryForm />
      <DiaryList entries={mockEntries} />
    </div>
  );
};

export default Dashboard;