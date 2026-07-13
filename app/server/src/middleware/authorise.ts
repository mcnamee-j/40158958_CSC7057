//file checks users role is authorised for requested route
import type { Request, Response, NextFunction } from "express";

const authorise = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (!allowedRoles.includes((req as any).user.role)) {
      res.status(403).json({ error: "Permission declined" });
      return;
    }

    next();
  };
};

export default authorise;
