import { Express } from 'express-serve-static-core';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        // 他のユーザープロパティをここに追加
      };
    }
  }
}