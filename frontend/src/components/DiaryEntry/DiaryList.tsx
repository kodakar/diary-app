import React from 'react';

interface DiaryEntry {
  id: string;
  content: string;
  date: string;
}

const DiaryList: React.FC<{ entries: DiaryEntry[] }> = ({ entries }) => (
  <ul>
    {entries.map((entry) => (
      <li key={entry.id}>
        <h3>{entry.date}</h3>
        <p>{entry.content}</p>
      </li>
    ))}
  </ul>
);

export default DiaryList;