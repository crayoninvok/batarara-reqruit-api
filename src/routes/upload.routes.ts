import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { upload } from '../middleware/multer'; // multer middleware
import { verifyTokenUser } from '../middleware/verifyTokenUser';

export class UploadRouter {
  private controller = new UploadController();
  private router = Router();

  constructor() {
    this.router.post('/avatar', verifyTokenUser, upload.single('avatar'), this.controller.uploadAvatar);
    this.router.post('/certificate', verifyTokenUser, upload.single('certificate'), this.controller.uploadCertificate);
  }

  public getRouter(): Router {
    return this.router;
  }
}
