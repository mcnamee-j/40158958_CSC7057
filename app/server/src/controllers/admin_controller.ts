import type { Request, Response, NextFunction } from "express";
import admin_services from "../services/admin_services.js";

const get_overview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const overview = await admin_services.get_admin_overview();
    res.status(200).json(overview);
  } catch (e) {
    next(e);
  }
};

export default { get_overview };
