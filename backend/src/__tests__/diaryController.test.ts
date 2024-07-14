import { Request, Response, NextFunction } from 'express';
import { createDiary, getDiaries, getDiary, updateDiary, deleteDiary } from '../controllers/diaryController';
import Diary from '../models/Diary';
import { generateAIFeedback } from '../services/openai';
import { AppError } from '../utils/errors';

jest.mock('../models/Diary');
jest.mock('../services/openai');

describe('Diary Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      user: { id: 'testUserId' },
      body: {},
      params: {}
    };
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    } as Partial<Response>;
    mockNext = jest.fn();
  });

  describe('createDiary', () => {
    it('should create a new diary entry', async () => {
      mockRequest.body = { content: 'Test content', mood: 'Happy' };
      const mockAIAnalysis = { sentiment: 'Positive' };
      const mockSavedDiary = { ...mockRequest.body, user: 'testUserId', aiAnalysis: mockAIAnalysis };

      (generateAIFeedback as jest.Mock).mockResolvedValue(mockAIAnalysis);
      (Diary.prototype.save as jest.Mock).mockResolvedValue(mockSavedDiary);

      await createDiary(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockSavedDiary);
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await createDiary(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('getDiaries', () => {
    it('should get all diary entries for a user', async () => {
      const mockDiaries = [{ _id: 'diary1', content: 'Test content' }];
      (Diary.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockDiaries)
      });

      await getDiaries(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockDiaries);
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await getDiaries(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not authenticated' });
    });
  });

  describe('getDiary', () => {
    it('should get a specific diary entry', async () => {
      const mockDiary = { _id: 'diary1', content: 'Test content' };
      mockRequest.params = { id: 'diary1' };
      (Diary.findOne as jest.Mock).mockResolvedValue(mockDiary);

      await getDiary(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockDiary);
    });

    it('should return 404 if diary is not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      (Diary.findOne as jest.Mock).mockResolvedValue(null);

      await getDiary(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Diary not found' });
    });
  });

  describe('updateDiary', () => {
    it('should update a diary entry', async () => {
      mockRequest.params = { id: 'diary1' };
      mockRequest.body = { content: 'Updated content', mood: 'Excited' };
      const mockUpdatedDiary = { ...mockRequest.body, _id: 'diary1' };
      (Diary.findOneAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedDiary);

      await updateDiary(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedDiary);
    });

    it('should return 404 if diary to update is not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      (Diary.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      await updateDiary(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Diary not found' });
    });
  });

  describe('deleteDiary', () => {
    it('should delete a diary entry', async () => {
      mockRequest.params = { id: 'diary1' };
      (Diary.findOneAndDelete as jest.Mock).mockResolvedValue({ _id: 'diary1' });

      await deleteDiary(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Diary deleted successfully' });
    });

    it('should return 404 if diary to delete is not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      (Diary.findOneAndDelete as jest.Mock).mockResolvedValue(null);

      await deleteDiary(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Diary not found' });
    });
  });
});