// Restricts a route to specific roles.
// Must run after authenticate().
// Logs an audit entry for any denied access attempt before returning 403.

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
        // records denied access attempts for security auditing
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
      // fallback for any unexpected errors
      return res.status(403).json({ error: "Something went wrong" });
    }
  };
};

export default authorise;
