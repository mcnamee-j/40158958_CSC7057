// Controllers validate request shape, delegate business logic to the
// service layer, and map known service error messages to HTTP status
// codes. Unexpected errors are passed to next(e) for centralised handling.

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

const create_org = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, type, address, phone, email } = req.body;
    if (!name || !type) {
      res.status(400).json({ error: "name and type are required" });
      return;
    }
    const org = await admin_services.create_organisation(
      name,
      type,
      address,
      phone,
      email,
    );
    res.status(201).json({ organisation: org });
  } catch (e: any) {
    if (e.message === "Invalid organisation type") {
      res
        .status(400)
        .json({ error: "Type must be 'pharmacy' or 'gp_surgery'" });
      return;
    }
    next(e);
  }
};

const list_orgs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organisations = await admin_services.list_organisations();
    res.status(200).json({ organisations });
  } catch (e) {
    next(e);
  }
};

const list_links = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const links = await admin_services.list_organisation_links();
    res.status(200).json({ links });
  } catch (e) {
    next(e);
  }
};

const create_link = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pharmacy_id, gp_surgery_id } = req.body;
    if (!pharmacy_id || !gp_surgery_id) {
      res
        .status(400)
        .json({ error: "pharmacy_id and gp_surgery_id are required" });
      return;
    }
    const link = await admin_services.create_organisation_link(
      pharmacy_id,
      gp_surgery_id,
    );
    res.status(201).json({ link });
  } catch (e: any) {
    if (
      e.message === "Invalid pharmacy organisation" ||
      e.message === "Invalid GP surgery organisation"
    ) {
      res.status(400).json({ error: e.message });
      return;
    }
    if (e.message === "Organisations are already linked") {
      res.status(409).json({ error: e.message });
      return;
    }
    next(e);
  }
};

const deactivate_org = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organisation_id = parseInt(req.params.id as string, 10);
    if (!Number.isInteger(organisation_id)) {
      res.status(400).json({ error: "Invalid organisation id" });
      return;
    }
    await admin_services.deactivate_organisation(organisation_id);
    res.status(200).json({ message: "Organisation deactivated" });
  } catch (e: any) {
    if (e.message === "Organisation not found") {
      res.status(404).json({ error: "Organisation not found" });
      return;
    }
    if (e.message === "Cannot deactivate system organisation") {
      res.status(400).json({ error: e.message });
      return;
    }
    next(e);
  }
};

const reactivate_org = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organisation_id = parseInt(req.params.id as string, 10);
    if (!Number.isInteger(organisation_id)) {
      res.status(400).json({ error: "Invalid organisation id" });
      return;
    }
    await admin_services.reactivate_organisation(organisation_id);
    res.status(200).json({ message: "Organisation reactivated" });
  } catch (e: any) {
    if (e.message === "Organisation not found") {
      res.status(404).json({ error: e.message });
      return;
    }
    if (e.message === "Cannot reactivate the system organisation") {
      res.status(400).json({ error: e.message });
      return;
    }
    next(e);
  }
};

export default {
  get_overview,
  create_org,
  list_orgs,
  list_links,
  create_link,
  deactivate_org,
  reactivate_org,
};
