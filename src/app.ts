import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes';
import { connectDB, connectRedis } from './config';
import { notFound, errorHandler } from './utils/errorMiddleware';
import { responseFormatter } from './middleware/responseMiddleware';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB and Redis
connectDB();
connectRedis();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Response formatting middleware
app.use(responseFormatter);

// API Routes
app.use('/api', routes);

// Base route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Recommendation System API',
    docs: '/api/docs'
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app; 