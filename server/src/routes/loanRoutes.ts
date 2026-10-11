import { Router } from 'express';
import { applyLoan, getMyLoans, getLoanById } from '../controllers/loanController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/rbacMiddleware';

const router = Router();

router.post('/apply', authenticateToken, authorizeRoles('BORROWER', 'ADMIN'), applyLoan);
router.get('/my-applications', authenticateToken, authorizeRoles('BORROWER', 'ADMIN'), getMyLoans);
router.get('/:id', authenticateToken, getLoanById);

export default router;
