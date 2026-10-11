import { Router, Response, NextFunction } from 'express';
import { evaluateBREEndpoint } from '../controllers/breController';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, IUserPayload } from '../types';

const router = Router();

// Optional auth helper: if bearer token exists, attach req.user, else continue
const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'fallback_secret_creditsea_2026';
    try {
      req.user = jwt.verify(token, secret) as IUserPayload;
    } catch (e) {
      // Ignore token error in optional check
    }
  }
  next();
};

router.post('/evaluate', optionalAuth, evaluateBREEndpoint);

export default router;
