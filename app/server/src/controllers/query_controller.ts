// Controllers validate request shape, delegate business logic to the
// service layer, and map known service error messages to HTTP status
// codes. Unexpected errors are passed to next(e) for centralised handling.

import type { Request, Response, NextFunction } from "express";
import query_services from "../services/query_services.js";

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
    if (e.message === "Organisations are not linked") {
      res.status(403).json({ error: "Organisations are not linked" });
      return;
    }

    if (
      e.message ===
      "Invalid patient identifiers - require two patient identifiers"
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
// query params arrive as strings and therefore require casting
//  to expected types before passing to the service layer.
const list_queries = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = (req as any).user;

    const {
      status,
      priority,
      category,
      search,
      patient_initials,
      patient_dob,
      patient_hcn,
      org_id,
      date,
      page,
      limit,
      assigned_to,
    } = req.query;

    const result = await query_services.get_org_queries(user, {
      status: status as string | undefined,
      priority: priority as string | undefined,
      category: category as string | undefined,
      search: search as string | undefined,
      patient_initials: patient_initials as string | undefined,
      patient_dob: patient_dob as string | undefined,
      patient_hcn: patient_hcn as string | undefined,
      org_id: org_id ? parseInt(org_id as string, 10) : undefined,
      date: date as string | undefined,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      assigned_to: assigned_to
        ? parseInt(assigned_to as string, 10)
        : undefined,
    });

    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

const get_query = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const query_id = parseInt(req.params.id as string, 10);

    if (!Number.isInteger(query_id)) {
      res.status(400).json({ error: "Invalid query id" });
      return;
    }

    const result = await query_services.get_query_by_id(user, query_id);

    if (!result) {
      res.status(404).json({ error: "Query not found" });
      return;
    }

    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

const reply_to_query = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = (req as any).user;
    const query_id = parseInt(req.params.id as string, 10);

    if (!Number.isInteger(query_id)) {
      res.status(400).json({ error: "Invalid query id" });
      return;
    }

    const { body, is_internal } = req.body;

    if (!body || typeof body !== "string" || body.trim().length === 0) {
      res.status(400).json({ error: "Reply body is required" });
      return;
    }

    const reply = await query_services.add_reply(
      user,
      query_id,
      body,
      is_internal === true,
    );

    res.status(201).json({ reply });
  } catch (e: any) {
    if (e.message === "Query not found") {
      res.status(404).json({ error: "Query not found" });
      return;
    }
    next(e);
  }
};

//update status
const update_query_status = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = (req as any).user;
    const query_id = parseInt(req.params.id as string, 10);

    if (!Number.isInteger(query_id)) {
      res.status(400).json({ error: "Invalid query id" });
      return;
    }

    const { status, resolution_note } = req.body;

    if (!status) {
      res.status(400).json({ error: "Status is required" });
      return;
    }

    const query = await query_services.update_status(
      user,
      query_id,
      status,
      resolution_note,
    );

    res.status(200).json({ query });
  } catch (e: any) {
    if (e.message === "Query not found") {
      res.status(404).json({ error: "Query not found" });
      return;
    }
    if (e.message === "Invalid status") {
      res.status(400).json({ error: "Invalid status value given" });
    }
    next(e);
  }
};

const assign_query_to_user = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = (req as any).user;
    const query_id = parseInt(req.params.id as string, 10);

    if (!Number.isInteger(query_id)) {
      res.status(400).json({ error: "Invalid query id" });
      return;
    }

    const { assigned_to, escalate } = req.body;

    if (!assigned_to) {
      res.status(400).json({ error: "assigned_to is required" });
      return;
    }

    const query = await query_services.assign_query(
      user,
      query_id,
      assigned_to,
      escalate === true,
    );

    res.status(200).json({ query });
  } catch (e: any) {
    if (e.message === "Query not found") {
      res.status(404).json({ error: "Query not found" });
      return;
    }
    if (e.message === "Invalid staff assignment") {
      res.status(400).json({
        error: "Assignee must be an active user in your organisation",
      });
      return;
    }
    next(e);
  }
};

export default {
  create_query,
  list_queries,
  get_query,
  reply_to_query,
  update_query_status,
  assign_query_to_user,
};
