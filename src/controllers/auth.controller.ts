import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { genSalt, hash, compare } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import path from "path";
import fs from "fs";
import handlebars from "handlebars";
import { transporter } from "../services/mailer";

export class AuthController {
  registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, name, avatar } = req.body;

      if (!email || !password || !name) {
        res
          .status(400)
          .json({ message: "Email, password, and name are required" });
        return;
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(409).json({ message: "Email already exists" });
        return;
      }

      const salt = await genSalt(10);
      const hashedPassword = await hash(password, salt);

      const avatarUrl =
        avatar && avatar.trim() !== ""
          ? avatar
          : `https://i.pravatar.cc/150?img=${
              Math.floor(Math.random() * 70) + 1
            }`;

      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          avatar: avatarUrl,
        },
      });

      // Compile the welcome email template
      const templatePath = path.join(__dirname, "../templates/welcomeUser.hbs");
      const templateSource = fs.readFileSync(templatePath, "utf-8");
      const compiledTemplate = handlebars.compile(templateSource);
      const jwtToken = sign({ id: newUser.id }, process.env.JWT_KEY!, {
        expiresIn: "1d",
      });
      const verifyLink = `${process.env.BASE_URL_FE}/verify-email/${jwtToken}`;
      const html = compiledTemplate({
        name,
        email,
        verifyLink,
      });

      // Send email
      await transporter.sendMail({
        from: `"Welcome Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to Our Platform!",
        html,
      });

      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      });
    } catch (err) {
      console.error("Register error:", err);
      res.status(500).json({ message: "Registration failed" });
    }
  };

  loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
  
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
  
      const valid = await compare(password, user.password);
      if (!valid) {
        res.status(401).json({ message: "Incorrect password" });
        return;
      }
  
      const token = sign({ id: user.id, type: "user" }, process.env.JWT_KEY!, {
        expiresIn: "1d",
      });
  
      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar, // Include the avatar field
          isVerify: user.isVerify // Optionally include other useful fields
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Login failed" });
    }
  }

  loginAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const admin = await prisma.user.findFirst({
        where: { email, role: "ADMIN" },
      });

      if (!admin) {
        res.status(404).json({ message: "Admin not found" });
        return;
      }

      const valid = await compare(password, admin.password);
      if (!valid) {
        res.status(401).json({ message: "Incorrect password" });
        return;
      }

      const token = sign(
        { id: admin.id, type: "admin" },
        process.env.JWT_KEY!,
        { expiresIn: "1d" }
      );

      res.status(200).json({
        message: "Admin login successful",
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Admin login failed" });
    }
  };

  verifyUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.params;
      const decoded: any = verify(token, process.env.JWT_KEY!);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
  
      // Jika sudah diverifikasi, langsung redirect ke login
      if (user.isVerify) {
        res.redirect(`${process.env.BASE_URL_FE}/login`);
        return;
      }
  
      // Update status isVerify = true
      await prisma.user.update({
        where: { id: user.id },
        data: { isVerify: true, verificationToken: null },
      });
  
      // Redirect ke login page setelah berhasil verifikasi
      res.redirect(`${process.env.BASE_URL_FE}/login`);
    } catch (err) {
      console.error("❌ Verification error:", err);
      res.redirect(`${process.env.BASE_URL_FE}/verify-failed`);
    }
  };
}
