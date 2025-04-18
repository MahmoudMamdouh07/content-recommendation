import { Router } from 'express';
import interactionRoutes from './interactionRoutes';
import recommendationRoutes from './recommendationRoutes';
import authRoutes from './authRoutes';
import contentRoutes from './contentRoutes';

const router = Router();

// Register routes
router.use('/auth', authRoutes);
router.use('/interactions', interactionRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/content', contentRoutes);

export default router; 