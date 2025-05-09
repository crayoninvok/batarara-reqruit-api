import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

export class AuthRouter {
  private controller: AuthController;
  private router: Router;

  constructor() {
    this.controller = new AuthController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/register', this.controller.registerUser);
    this.router.post('/login', this.controller.loginUser);
    this.router.post('/admin/login', this.controller.loginAdmin);
    this.router.get('/verifyuser/:token', this.controller.verifyUser);
  }

  public getRouter(): Router {
    return this.router;
  }
}
