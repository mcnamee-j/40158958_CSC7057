import type { Request, Response, NextFunction } from "express";
import authServices from "../services/auth_services.js";
import auth_services from "../services/auth_services.js";
import { error } from "console";

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

//forgot password
const forgot_password = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    await authServices.forgot_password(email);

    res.status(200).json({
      message: "Reset link sent to email. You shall receive it shortly",
    });
  } catch (e: any) {
    next(e);
  }
};

//reset password
const reset_password = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      res
        .status(400)
        .json({ error: "Both token and new password are required" });
      return;
    }

    if (new_password.length < 8) {
      res
        .status(400)
        .json({ error: "Passwords must be more than 8 characters long" });
      return;
    }

    await auth_services.reset_password(token, new_password);

    res.status(200).json({ message: "Password reset successful" });
  } catch (e: any) {
    if (e.message === "Invalid or expired reset token") {
      res.status(400).json({ error: "Invalid or expired reset token" });
      return;
    }
    next(e);
  }
};

const get_user = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const user = await authServices.get_user(userId);

    res.status(200).json({
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        organisation: user.organisation_id,
        organisation_name: user.organisation_name,
      },
    });
  } catch (e: any) {
    if (e.message === "User not found") {
      res.status(404).json({ error: "User not found" });
      return;
    }
    next(e);
  }
};

export default {
  login,
  logout,
  refresh,
  forgot_password,
  reset_password,
  get_user,
};
