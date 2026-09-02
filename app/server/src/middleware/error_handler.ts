// Express error-handling middleware
// Any error passed to next(e) from a controller ends up here.
// Logs the full error server-side but returns
// a generic message to the client to avoid leaking internals.

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
