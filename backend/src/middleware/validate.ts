import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from './errorHandler';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join(', ');
    
    // Log validation errors for debugging
    console.error('❌ Validation Error:');
    console.error('Path:', req.path);
    console.error('Method:', req.method);
    console.error('Body:', JSON.stringify(req.body, null, 2));
    console.error('Errors:', JSON.stringify(errors.array(), null, 2));
    
    throw new AppError(errorMessages, 400);
  }

  next();
};
