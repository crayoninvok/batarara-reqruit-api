import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export const verifyTokenAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = verify(token, process.env.JWT_KEY!) as { id: string };

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: Admin access only' });
    }

    (req as any).user = { id: user.id };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
