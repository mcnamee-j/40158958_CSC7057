import type { Request, Response, NextFunction } from "express";

const error_handler = (
  e: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(e.message);
  res.status(500).json({ error: "Server error" });
};

export default error_handler;
