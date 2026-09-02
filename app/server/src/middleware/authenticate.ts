// Verifies the JWT access token from the Authorization header and attaches
// the decoded payload to req.user.
// Runs before authorise() on protected routes,
// returns 401 for any missing/malformed/invalid token.

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header) {
    res.status(401).json({ error: "No token provided" });
    return;
  }
  // expects "Bearer <token>" format
  // [1] extracts the token portion
  const token = header.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Invalid authorization header" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET!);
    // express's Request type doesn't know about a custom user property
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export default authenticate;
