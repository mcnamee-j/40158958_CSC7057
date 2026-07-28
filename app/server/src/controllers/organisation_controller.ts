import type { Request, Response, NextFunction } from "express";
import organisation_services from "../services/organisation_services.js";

const get_linked_orgs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = (req as any).user;
    const organisations =
      await organisation_services.get_linked_organisations(user);
    res.status(200).json({ organisations });
  } catch (e) {
    next(e);
  }
};

export default { get_linked_orgs };
