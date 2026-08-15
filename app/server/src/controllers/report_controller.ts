// Controllers validate request shape, delegate business logic to the
// service layer, and map known service error messages to HTTP status
// codes. Unexpected errors are passed to next(e) for centralised handling.

import type { Request, Response, NextFunction } from "express";
import report_services from "../services/report_services.js";

const get_stats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const stats = await report_services.get_statistics(user.organisation_id);
    res.status(200).json(stats);
  } catch (e) {
    next(e);
  }
};

export default { get_stats };
