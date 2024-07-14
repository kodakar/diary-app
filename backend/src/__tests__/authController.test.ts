import { Request, Response, NextFunction } from 'express';
import { register, login } from '../controllers/authController';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors';

jest.mock('../models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {}
    };
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    } as Partial<Response>;
    mockNext = jest.fn();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      mockRequest.body = userData;

      const mockSavedUser = {
        _id: 'someId',
        username: userData.username,
        email: userData.email,
        password: 'hashedPassword'
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (User.prototype.save as jest.Mock).mockResolvedValue(mockSavedUser);
      (jwt.sign as jest.Mock).mockReturnValue('fakeToken');

      await register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        user: {
          _id: 'someId',
          username: userData.username,
          email: userData.email
        },
        token: 'fakeToken'
      });
    });

    it('should call next with AppError if user already exists', async () => {
      const userData = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123'
      };
      mockRequest.body = userData;

      (User.findOne as jest.Mock).mockResolvedValue({ email: userData.email });

      await register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User already exists',
          statusCode: 400,
          isOperational: true
        })
      );
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      mockRequest.body = loginData;

      const mockUser = {
        _id: 'someId',
        username: 'testuser',
        email: loginData.email,
        password: 'hashedPassword'
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('fakeToken');

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        user: {
          _id: 'someId',
          username: 'testuser',
          email: loginData.email
        },
        token: 'fakeToken'
      });
    });

    it('should call next with AppError for invalid credentials', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      (User.findOne as jest.Mock).mockResolvedValue({
        email: 'test@example.com',
        password: 'hashedPassword'
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid credentials',
          statusCode: 401,
          isOperational: true
        })
      );
    });
  });
});