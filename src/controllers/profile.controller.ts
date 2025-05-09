import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export class ProfileController {
    updateFullProfile = async (req: Request, res: Response): Promise<void> => {
        try {
          const userId = (req as any).user?.id;
          const { bio, phone, address, educations, experiences } = req.body;
          if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
          }
          await prisma.profile.upsert({
            where: { userId },
            update: { bio, phone, address },
            create: { userId, bio, phone, address },
          });
          if (Array.isArray(educations)) {
            await prisma.education.deleteMany({ where: { userId } });
            await prisma.education.createMany({
              data: educations.map((edu) => ({ ...edu, userId })),
            });
          }
          if (Array.isArray(experiences)) {
            await prisma.experience.deleteMany({ where: { userId } });
            await prisma.experience.createMany({
              data: experiences.map((exp) => ({ ...exp, userId })),
            });
          }
          res.status(200).json({ message: "Profile updated successfully" });
        } catch (err) {
          console.error("Update profile error:", err);
          res.status(500).json({ message: "Failed to update full profile" });
        }
      }; 

      getProfile = async (req: Request, res: Response): Promise<void> => {
        try {
          const userId = (req as any).user?.id;
      
          if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
          }
      
          const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
              profile: true,
              educations: true,
              experiences: true,
            },
          });
      
          if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
          }
      
          res.status(200).json({ user });
        } catch (err) {
          console.error("Get profile error:", err);
          res.status(500).json({ message: "Failed to fetch profile" });
        }
      };         
}
