import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/errors';

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User already exists', 400));
  }

  const hashedPassword = await bcrypt.hash(password, 8);

  const user = new User({
    username,
    email,
    password: hashedPassword
  });

  const savedUser = await user.save();

  const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

  const userResponse = {
    _id: savedUser._id,
    username: savedUser.username,
    email: savedUser.email
  };

  res.status(201).json({ user: userResponse, token });
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Invalid credentials', 401));
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

  const userResponse = {
    _id: user._id,
    username: user.username,
    email: user.email
  };

  res.status(200).json({ user: userResponse, token });
});