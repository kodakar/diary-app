import { Request, Response, NextFunction } from 'express';
import Diary from '../models/Diary';
import { generateAIFeedback } from '../services/openai';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/errors';

export const createDiary = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { content, mood } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  try {
    const aiAnalysis = await generateAIFeedback(content);

    const newDiary = new Diary({
      user: userId,
      content,
      mood,
      aiAnalysis
    });

    const savedDiary = await newDiary.save();
    res.status(201).json(savedDiary);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Error creating diary entry', 500));
  }
});
// ユーザーの全ての日記エントリーを取得
export const getDiaries = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const diaries = await Diary.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(diaries);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching diaries', error });
  }
};

// 特定の日記エントリーを取得
export const getDiary = async (req: Request, res: Response) => {
  try {
    const diaryId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const diary = await Diary.findOne({ _id: diaryId, user: userId });
    if (!diary) {
      return res.status(404).json({ message: 'Diary not found' });
    }
    res.status(200).json(diary);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching diary', error });
  }
};

// 日記エントリーを更新
export const updateDiary = async (req: Request, res: Response) => {
  try {
    const diaryId = req.params.id;
    const userId = req.user?.id;
    const { content, mood } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const updatedDiary = await Diary.findOneAndUpdate(
      { _id: diaryId, user: userId },
      { content, mood },
      { new: true }
    );

    if (!updatedDiary) {
      return res.status(404).json({ message: 'Diary not found' });
    }
    res.status(200).json(updatedDiary);
  } catch (error) {
    res.status(400).json({ message: 'Error updating diary', error });
  }
};

// 日記エントリーを削除
export const deleteDiary = async (req: Request, res: Response) => {
  try {
    const diaryId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const deletedDiary = await Diary.findOneAndDelete({ _id: diaryId, user: userId });
    if (!deletedDiary) {
      return res.status(404).json({ message: 'Diary not found' });
    }
    res.status(200).json({ message: 'Diary deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting diary', error });
  }
};