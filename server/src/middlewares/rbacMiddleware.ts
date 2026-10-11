import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required prior to authorization check.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Your role '${req.user.role}' is not authorized to access this resource.`,
      });
      return;
    }

    next();
  };
};
