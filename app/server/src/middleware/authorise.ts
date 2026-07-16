//file checks users role is authorised for requested route
import type { Request, Response, NextFunction } from "express";
import pool from "../config/db.js";

const authorise = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!(req as any).user) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      if (!allowedRoles.includes((req as any).user.role)) {
        await pool.query(
          `INSERT INTO audit_log (user_id, action, performed_at)
        VALUES ($1, 'unauthorised_access_attempt', NOW())`,
          [(req as any).user.userId],
        );
        res.status(403).json({ error: "Permission declined" });
        return;
      }

      next();
    } catch {
      return res.status(403).json({ error: "Something went wrong" });
    }
  };
};

export default authorise;
