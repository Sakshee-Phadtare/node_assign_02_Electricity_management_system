import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';

dotenv.config();
const app = express();

const startServer = () => {
  const allowedOrigins = [
    process.env.CORS_ORIGIN,
    process.env.LOCAL_ORIGIN  // destructuring
  ];

  
  const corsOptions = {
    origin: function match(origin, validate) {
   
      if (allowedOrigins.includes(origin) || !origin) {
        validate(null, true);
      } else {
        validate(new Error('Not allowed by CORS'), false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
    credentials: true,
  };


  app.use(express.json());
  app.use(cors(corsOptions));

  app.use('/api/auth', authRoutes);

  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`Server is running on: ${PORT}`);
  });
};

export default startServer;
