import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'; 

import authRoutes from './routes/authRoutes';
import diaryRoutes from './routes/diaryRoutes';

import { auth } from './middleware/auth';

dotenv.config();  // .envファイルから環境変数を読み込む

const app: Express = express();
const port = process.env.PORT || 3000;

// ミドルウェアの設定
app.use(cors());  // 追加
app.use(express.json());  // JSONリクエストボディの解析を可能にする


// ルートの追加
app.use('/api/diaries', diaryRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/diaries', auth, diaryRoutes);

// MongoDBへの接続
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// ルートの設定
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript Express!');
});

// サーバーの起動
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;