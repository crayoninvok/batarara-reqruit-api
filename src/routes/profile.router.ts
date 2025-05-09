import { Router } from "express";
import { ProfileController } from "../controllers/profile.controller";
import { verifyTokenUser } from "../middleware/verifyTokenUser";

export class ProfileRouter {
  private controller: ProfileController;
  private router: Router;

  constructor() {
    this.controller = new ProfileController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/", verifyTokenUser, this.controller.getProfile);
    this.router.put("/full", verifyTokenUser, this.controller.updateFullProfile);

  }

  public getRouter(): Router {
    return this.router;
  }
}
