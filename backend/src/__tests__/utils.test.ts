import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/errors';

describe('Utility Functions', () => {
    describe('catchAsync', () => {
        it('should pass error to next function if an error occurs', async () => {
          const mockReq = {} as Request;
          const mockRes = {} as Response;
          const mockNext = jest.fn();
          const mockError = new Error('Test error');
      
          const mockAsyncFunction = jest.fn().mockRejectedValue(mockError);
          const wrappedFunction = catchAsync(mockAsyncFunction);
      
          await wrappedFunction(mockReq, mockRes, mockNext);
      
          expect(mockNext).toHaveBeenCalledWith(mockError);
        });
      
        it('should execute the function normally if no error occurs', async () => {
          const mockReq = {} as Request;
          const mockRes = {} as Response;
          const mockNext = jest.fn();
      
          const mockAsyncFunction = jest.fn().mockResolvedValue('Success');
          const wrappedFunction = catchAsync(mockAsyncFunction);
      
          await wrappedFunction(mockReq, mockRes, mockNext);
      
          expect(mockAsyncFunction).toHaveBeenCalled();
          expect(mockNext).not.toHaveBeenCalled();
        });
      });

    describe('AppError', () => {
        it('should create an instance with correct properties', () => {
        const message = 'Test error message';
        const statusCode = 400;
        const error = new AppError(message, statusCode);
    
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe(message);
        expect(error.statusCode).toBe(statusCode);
        expect(error.isOperational).toBe(true);
        });
    
        it('should set correct statusCode for different error types', () => {
        const clientError = new AppError('Client error', 400);
        const serverError = new AppError('Server error', 500);
    
        expect(clientError.statusCode).toBe(400);
        expect(serverError.statusCode).toBe(500);
        });
    });
});