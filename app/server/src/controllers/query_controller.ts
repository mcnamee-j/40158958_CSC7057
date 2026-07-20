import type { Request, Response, NextFunction } from "express";
import query_services from "../services/query_services.js";
import { error } from "node:console";

//create a new query
const create_query = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { recipient_org_id, category, priority, patient, subject, body } =
      req.body;

    if (!recipient_org_id || !category || !subject || !body) {
      res.status(400).json({
        error: "Required fields: recipient_org_id, category, subject, body",
      });
      return;
    }

    const user = (req as any).user;

    const query = await query_services.create_query(user, {
      recipient_org_id,
      category,
      priority,
      patient,
      subject,
      body,
    });

    res.status(201).json({ query });
  } catch (e: any) {
    //capture each error
    if (e.message === "Organisations are not linked") {
      res.status(403).json({ error: "Organisations are not linked" });
      return;
    }

    if (
      e.message ===
      "Invalid patient identifiers - require two patient identifers"
    ) {
      res.status(400).json({
        error:
          "Two patient identifiers (HCN, initials, DOB) are required if any patient information is provided",
      });
      return;
    }
    next(e);
  }
};

// get orgs list of queries - w/ filters
const list_queries = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = (req as any).user;

    const { status, priority, category, search, page, limit } = req.query;

    const result = await query_services.get_org_queries(user, {
      status: status as string | undefined,
      priority: priority as string | undefined,
      category: category as string | undefined,
      search: search as string | undefined,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });

    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

export default { create_query, list_queries };
