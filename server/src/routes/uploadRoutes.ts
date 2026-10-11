import { Router } from 'express';
import { uploadSalarySlipController } from '../controllers/uploadController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { uploadSalarySlipMiddleware } from '../middlewares/uploadMiddleware';

const router = Router();

router.post(
  '/salary-slip',
  authenticateToken,
  uploadSalarySlipMiddleware.single('file'),
  uploadSalarySlipController
);

export default router;
