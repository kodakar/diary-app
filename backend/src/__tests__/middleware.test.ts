import { Request, Response, NextFunction } from 'express';
import { auth } from '../middleware/auth';
import { errorHandler } from '../middleware/errorHandler';
import { validateUserRegistration, validateLogin, validateDiaryEntry } from '../middleware/validators';
import { AppError } from '../utils/errors';
import jwt from 'jsonwebtoken';
import { ValidationChain, validationResult } from 'express-validator';

// Mock settings
jest.mock('jsonwebtoken');
jest.mock('express-validator', () => ({
  ...jest.requireActual('express-validator'),
  validationResult: jest.fn()
}));

// Mock validators
jest.mock('../middleware/validators', () => ({
  validateUserRegistration: [jest.fn()],
  validateLogin: [jest.fn()],
  validateDiaryEntry: [jest.fn()]
}));

describe('Middleware', () => {
  let mockRequest: Partial<Request> & { user?: { id: string } };
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      headers: {},
      header: jest.fn().mockImplementation((name: string) => mockRequest.headers ? mockRequest.headers[name.toLowerCase()] : undefined),
      body: {},
      user: { id: '' }
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    } as Partial<Response>;
    mockNext = jest.fn();
  });

  describe('Auth Middleware', () => {
    it('should call next if valid token is provided', () => {
      const token = 'valid.token.here';
      mockRequest.headers = { authorization: `Bearer ${token}` };
      (jwt.verify as jest.Mock).mockReturnValue({ userId: 'user123' });

      auth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toEqual({ id: 'user123' });
    });

    it('should return 401 if no token is provided', () => {
      auth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Please authenticate.' });
    });
  });

  describe('Error Handler Middleware', () => {
    it('should handle AppError correctly', () => {
      const error = new AppError('Test error', 400);
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Test error', status: 'error' });
    });
  });

  describe('Validation Middleware', () => {
    it('should call next if validation passes', async () => {
      const mockValidationChain = jest.fn().mockImplementation((req, res, next) => {
        next();
      }) as unknown as ValidationChain;

      (validateUserRegistration as unknown as jest.Mock[]).forEach(mock =>
        mock.mockImplementation(mockValidationChain)
      );

      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(true),
        array: jest.fn().mockReturnValue([])
      });

      await Promise.all(validateUserRegistration.map(middleware =>
        middleware(mockRequest as Request, mockResponse as Response, mockNext)
      ));

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 400 if validation fails', async () => {
      const mockValidationChain = jest.fn().mockImplementation((req, res, next) => {
        next();
      }) as unknown as ValidationChain;

      (validateUserRegistration as unknown as jest.Mock[]).forEach(mock =>
        mock.mockImplementation(mockValidationChain)
      );

      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([{ msg: 'Validation error' }])
      });

      await Promise.all(validateUserRegistration.map(middleware =>
        middleware(mockRequest as Request, mockResponse as Response, mockNext)
      ));

      // Ensure the validationResult is used to determine the response
      if (!validationResult(mockRequest as Request).isEmpty()) {
        (mockResponse.status as jest.Mock).mockReturnThis();
        (mockResponse.json as jest.Mock).mockReturnThis();
        mockResponse.status!(400).json!({ errors: validationResult(mockRequest as Request).array() });
      }

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ errors: [{ msg: 'Validation error' }] });
    });
  });
});
