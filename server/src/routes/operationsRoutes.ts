import { Router } from 'express';
import {
  getSalesLeads,
  getSanctionQueue,
  decideSanction,
  getDisbursementQueue,
  disburseLoan,
  getCollectionLoans,
  recordPayment,
  getAdminOverview,
} from '../controllers/operationsController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/rbacMiddleware';

const router = Router();

// Apply base authentication for all operations endpoints
router.use(authenticateToken);

// 1. Sales Module
router.get('/sales/leads', authorizeRoles('SALES', 'ADMIN'), getSalesLeads);

// 2. Sanction Module
router.get('/sanction/queue', authorizeRoles('SANCTION', 'ADMIN'), getSanctionQueue);
router.post('/sanction/:loanId/decide', authorizeRoles('SANCTION', 'ADMIN'), decideSanction);

// 3. Disbursement Module
router.get('/disbursement/queue', authorizeRoles('DISBURSEMENT', 'ADMIN'), getDisbursementQueue);
router.post('/disbursement/:loanId/disburse', authorizeRoles('DISBURSEMENT', 'ADMIN'), disburseLoan);

// 4. Collection Module
router.get('/collection/queue', authorizeRoles('COLLECTION', 'ADMIN'), getCollectionLoans);
router.post('/collection/:loanId/payment', authorizeRoles('COLLECTION', 'ADMIN'), recordPayment);

// 5. Admin Module
router.get('/admin/overview', authorizeRoles('ADMIN'), getAdminOverview);

export default router;
