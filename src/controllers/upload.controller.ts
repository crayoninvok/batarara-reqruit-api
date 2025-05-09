import { Request, Response } from 'express';
import cloudinary from '../utils/cloudinary';
import { prisma } from '../lib/prisma';

export class UploadController {
  // ✅ Upload Avatar
  uploadAvatar = async (req: Request, res: Response): Promise<void> => {
    try {
      const file = req.file;
      const userId = (req as any).user?.id;

      if (!file || !userId) {
        res.status(400).json({ message: 'File and user token are required' });
        return;
      }

      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'avatar_reqruiters' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(file.buffer);
      });

      const user = await prisma.user.update({
        where: { id: userId },
        data: { avatar: result.secure_url },
      });

      res.status(200).json({
        message: 'Avatar uploaded and saved!',
        secure_url: result.secure_url,
        user,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Avatar upload failed' });
    }
  };

  // ✅ Upload Certificate
  uploadCertificate = async (req: Request, res: Response): Promise<void> => {
    try {
      const file = req.file;

      if (!file) {
        res.status(400).json({ message: 'File is required' });
        return;
      }

      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'certificate_reqruiters', resource_type: 'auto' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(file.buffer);
      });

      res.status(200).json({
        message: 'Certificate uploaded!',
        secure_url: result.secure_url,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Certificate upload failed' });
    }
  };
}
