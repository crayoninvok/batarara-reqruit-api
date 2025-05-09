import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

export const verifyTokenUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = verify(token, process.env.JWT_KEY!) as { id: string; type: string };

    if (decoded.type !== 'user') {
      return res.status(403).json({ message: 'Forbidden: Not a user token' });
    }

    (req as any).user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
