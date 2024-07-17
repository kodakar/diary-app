import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/errors';

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body;
  const errors = [];

  if (!username || username.length < 3) {
    errors.push({ field: 'username', message: 'Username must be at least 3 characters long' });
  }
  if (!email || !email.includes('@')) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }
  if (!password || password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists with email:', email);
      return next(new AppError('User already exists', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    const savedUser = await user.save();
    console.log('User saved successfully:', savedUser._id);

    const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

    const userResponse = {
      _id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email
    };

    res.status(201).json({ user: userResponse, token });
  } catch (error) {
    console.error('Error in user registration:', error);
    return next(new AppError('Error registering user', 500));
  }
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