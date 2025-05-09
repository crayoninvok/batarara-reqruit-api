import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // ✅ tambahkan ini
import { AuthRouter } from './routes/auth.routes';
import { UploadRouter } from './routes/upload.routes';

dotenv.config();
const app = express();

// ✅ Setup CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000', // frontend kamu
  credentials: true,
}));

app.use(express.json());

const authRouter = new AuthRouter();
const uploadRouter = new UploadRouter();

app.use('/api/auth', authRouter.getRouter());
app.use('/api/upload', uploadRouter.getRouter());

app.listen(8000, () => {
  console.log('🚀 Server running at http://localhost:8000');
});
