// Controllers validate request shape, delegate business logic to the
// service layer, and map known service error messages to HTTP status
// codes. Unexpected errors are passed to next(e) for centralised handling.

import type { Request, Response, NextFunction } from "express";
import report_services from "../services/report_services.js";

const get_stats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    let organisation_id = user.organisationId;

    //managers are scoped to their own org already, admins aren't tied to one
    if (user.role === "admin") {
      const org_id = parseInt(req.query.organisation_id as string, 10);
      if (!Number.isInteger(org_id)) {
        res
          .status(400)
          .json({ error: "organisation_id is required for admin" });
        return;
      }
      organisation_id = org_id;
    }

    const stats = await report_services.get_statistics(organisation_id);
    res.status(200).json(stats);
  } catch (e) {
    next(e);
  }
};

export default { get_stats };
