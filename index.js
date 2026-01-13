import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import todoRoutes from './routes/todos.js';

// 환경변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS 설정
app.use(cors());

// JSON 파싱 미들웨어
app.use(express.json());

// MongoDB 연결
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-db');
    console.log('연결 성공');
  } catch (error) {
    console.error('MongoDB 연결 실패:', error);
    process.exit(1);
  }
};

// 라우터 등록 (정적 파일 제공 전에)
app.use('/api/todos', todoRoutes);

// 정적 파일 제공 (프론트엔드) - 라우터 이후에 배치
app.use(express.static('public'));

// 서버 시작
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}번에서 실행 중입니다.`);
  });
};

startServer();
