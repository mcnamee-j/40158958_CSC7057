//file verifys jwt tokens
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header) {
    res.status(401).json({ error: "No toke provided" });
    return;
  }

  const token = header.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Invalid authorization header" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET!);
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export default authenticate;
