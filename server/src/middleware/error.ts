import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    data: null,
    error: { message: `Route ${req.method} ${req.path} not found` },
  });
};

export const errorHandler = (
  err: Error & { statusCode?: number },
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  logger.error(err.message, { stack: err.stack });

  const statusCode = err.statusCode ?? 500;
  const message =
    statusCode === 500 ? 'An error has occurred on the server' : err.message;

  res.status(statusCode).json({
    success: false,
    data: null,
    error: { message },
  });

  next();
};
