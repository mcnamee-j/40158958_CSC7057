import type { Request, Response, NextFunction } from "express";
import authServices from "../services/auth_services.js";

//login
const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Both email and password are required" });
      return;
    }

    const response = await authServices.login(email, password);

    res.status(200).json(response);
  } catch (e: any) {
    if (e.message === "Invalid Credentials") {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    next(e); //passes any unexpected errors to the error handler in middleware
  }
};

//logout
const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      res.status(400).json({ error: "Refresh token required" });
      return;
    }
    await authServices.logout(refresh_token);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (e) {
    next(e);
  }
};

//refresh
const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      res.status(400).json({ error: "Refresh token required" });
      return;
    }
    const result = await authServices.refresh(refresh_token);
    res.status(200).json(result);
  } catch (e: any) {
    if (e.message === "Invalid refresh token") {
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }
    next(e);
  }
};

export default { login, logout, refresh };
