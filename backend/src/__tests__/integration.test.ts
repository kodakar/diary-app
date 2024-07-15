import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import User from '../models/User';
import Diary from '../models/Diary';
import dotenv from 'dotenv';

dotenv.config();

describe('Integration Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI as string, {
        serverSelectionTimeoutMS: 10000 // 10秒のタイムアウト
      });
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
    }
  }, 15000); // Jestのタイムアウトを15秒に設定
  
  afterAll(async () => {
    try {
      await mongoose.connection.close();
    } catch (error) {
      console.error('Failed to close MongoDB connection:', error);
    }
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Diary.deleteMany({});
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('username', 'testuser');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should not register a user with existing email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser2',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'User already exists');
    });

    it('should login a user and return a token', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      authToken = response.body.token;
    });

    it('should not login with incorrect credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });

  describe('Diary Operations', () => {
    beforeEach(async () => {
      // Register and login a user before each test
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'diaryuser',
          email: 'diary@example.com',
          password: 'password123'
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'diary@example.com',
          password: 'password123'
        });

      authToken = loginResponse.body.token;
    });

    it('should create a new diary entry', async () => {
      const response = await request(app)
        .post('/api/diaries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'This is a test diary entry',
          mood: 'Happy'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('content', 'This is a test diary entry');
      expect(response.body).toHaveProperty('mood', 'Happy');
    });

    it('should get all diary entries for the user', async () => {
      // Create two diary entries
      await request(app)
        .post('/api/diaries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Diary entry 1',
          mood: 'Happy'
        });

      await request(app)
        .post('/api/diaries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Diary entry 2',
          mood: 'Sad'
        });

      const response = await request(app)
        .get('/api/diaries')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(2);
    });

    it('should get a specific diary entry', async () => {
      const createResponse = await request(app)
        .post('/api/diaries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Specific diary entry',
          mood: 'Excited'
        });

      const diaryId = createResponse.body._id;

      const getResponse = await request(app)
        .get(`/api/diaries/${diaryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body).toHaveProperty('_id', diaryId);
      expect(getResponse.body).toHaveProperty('content', 'Specific diary entry');
      expect(getResponse.body).toHaveProperty('mood', 'Excited');
    });

    it('should update a diary entry', async () => {
      const createResponse = await request(app)
        .post('/api/diaries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Original content',
          mood: 'Neutral'
        });

      const diaryId = createResponse.body._id;

      const updateResponse = await request(app)
        .put(`/api/diaries/${diaryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Updated content',
          mood: 'Happy'
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body).toHaveProperty('content', 'Updated content');
      expect(updateResponse.body).toHaveProperty('mood', 'Happy');
    });

    it('should delete a diary entry', async () => {
      const createResponse = await request(app)
        .post('/api/diaries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'To be deleted',
          mood: 'Anxious'
        });

      const diaryId = createResponse.body._id;

      const deleteResponse = await request(app)
        .delete(`/api/diaries/${diaryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toHaveProperty('message', 'Diary deleted successfully');

      // Verify the entry is actually deleted
      const getResponse = await request(app)
        .get(`/api/diaries/${diaryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });
  });

  describe('Error Handling', () => {
    it('should return 401 for unauthorized access', async () => {
      const response = await request(app).get('/api/diaries');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Please authenticate.');
    });

    it('should return 404 for non-existent diary', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/diaries/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Diary not found');
    });
  });
});