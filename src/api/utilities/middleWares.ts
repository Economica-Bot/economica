import { Request, Response, NextFunction } from 'express';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => (req.isAuthenticated() ? next() : res.sendStatus(403));
