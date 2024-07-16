import React, { useState } from 'react';

const DiaryForm: React.FC = () => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ここに日記エントリー送信のロジックを実装します
    console.log('Diary entry submitted:', content);
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your diary entry here..."
      />
      <button type="submit">Save Entry</button>
    </form>
  );
};

export default DiaryForm;