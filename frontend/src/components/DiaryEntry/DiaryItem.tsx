import React, { useState } from 'react';
import { DiaryEntry, updateDiary, deleteDiary } from '../../services/api';

interface DiaryItemProps {
  diary: DiaryEntry;
  onUpdate: (updatedDiary: DiaryEntry) => void;
  onDelete: (id: string) => void;
}

const DiaryItem: React.FC<DiaryItemProps> = ({ diary, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(diary.content);
  const [editedMood, setEditedMood] = useState(diary.mood || '');

  const handleUpdate = async () => {
    try {
      const updatedDiary = await updateDiary(diary._id, editedContent, editedMood);
      onUpdate(updatedDiary);
      setIsEditing(false);
    } catch (error) {
      console.error('日記の更新に失敗しました', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('本当にこの日記を削除しますか？')) {
      try {
        await deleteDiary(diary._id);
        onDelete(diary._id);
      } catch (error) {
        console.error('日記の削除に失敗しました', error);
      }
    }
  };

  if (isEditing) {
    return (
      <div>
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
        />
        <input
          type="text"
          value={editedMood}
          onChange={(e) => setEditedMood(e.target.value)}
          placeholder="気分"
        />
        <button onClick={handleUpdate}>保存</button>
        <button onClick={() => setIsEditing(false)}>キャンセル</button>
      </div>
    );
  }

  return (
    <div>
      <h3>{new Date(diary.createdAt).toLocaleDateString()}</h3>
      <p>{diary.content}</p>
      {diary.mood && <p>気分: {diary.mood}</p>}
      <button onClick={() => setIsEditing(true)}>編集</button>
      <button onClick={handleDelete}>削除</button>
    </div>
  );
};

export default DiaryItem;