import type { Request, Response, NextFunction } from "express";
import staff_services from "../services/staff_services.js";

const get_staff_org_id = (req: Request) => {
  const user = (req as any).user;
  if (user.role === "admin") {
    const org_id = parseInt(
      (req.query.organisation_id ?? req.body.organisation_id) as string,
      10,
    );
    if (!Number.isInteger(org_id)) {
      throw new Error("organisation_id is required");
    }
    return org_id;
  }
  return user.organisationId;
};

const staff_list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organisation_id = get_staff_org_id(req);
    const staff = await staff_services.list_staff(organisation_id);
    res.status(200).json({ staff });
  } catch (e: any) {
    if (e.message === "organisation_id is required") {
      res.status(400).json({ error: e.message });
      return;
    }
    next(e);
  }
};

const create_new_staff = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organisation_id = get_staff_org_id(req);
    const { first_name, last_name, email, role } = req.body;
    if (!first_name || !last_name || !email || !role) {
      res
        .status(400)
        .json({ error: "first_name, last_name, email, role are all required" });
      return;
    }
    const staff = await staff_services.create_staff(
      organisation_id,
      first_name,
      last_name,
      email,
      role,
    );
    res.status(201).json({ staff });
  } catch (e: any) {
    if (e.message === "organisation_id is required") {
      res.status(400).json({ error: e.message });
      return;
    }

    if (e.message === "Organisation not found") {
      res.status(404).json({ error: e.message });
      return;
    }

    if (e.message === "Invalid role for this organisation type") {
      res.status(400).json({ error: e.message });
      return;
    }

    if (e.message === "Email already in use") {
      res.status(409).json({ error: e.message });
      return;
    }
    next(e);
  }
};

const deactivate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organisation_id = get_staff_org_id(req);
    const user_id = parseInt(req.params.id as string, 10);
    const current_user_id = (req as any).user.userId;

    if (!Number(user_id)) {
      res.status(400).json({ error: "Invalid user id" });
      return;
    }
    await staff_services.deactivate_staff(
      organisation_id,
      user_id,
      current_user_id,
    );
    res.status(200).json({ message: "Staff member deactivated" });
  } catch (e: any) {
    if (e.message === "organisation_id is required") {
      res.status(400).json({ error: e.message });
      return;
    }
    if (e.message === "Cannot deactivate your own account") {
      res.status(400).json({ error: e.message });
      return;
    }
    if (e.message === "Staff member not found in this organisation") {
      res.status(404).json({ error: e.message });
      return;
    }
    next(e);
  }
};

const reset_password = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organisation_id = get_staff_org_id(req);
    const user_id = parseInt(req.params.id as string, 10);
    if (!Number.isInteger(user_id)) {
      res.status(400).json({ error: "Invalid user id" });
      return;
    }
    await staff_services.reset_staff_password(organisation_id, user_id);
    res.status(200).json({ message: "Password reset link sent" });
  } catch (e: any) {
    if (e.message === "organisation_id is required for admin") {
      res.status(400).json({ error: e.message });
      return;
    }
    if (e.message === "Staff member not found in this organisation") {
      res.status(404).json({ error: e.message });
      return;
    }
    if (e.message === "Cannot reset password for an inactive staff member") {
      res.status(400).json({ error: e.message });
      return;
    }
    next(e);
  }
};

const reactivate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organisation_id = get_staff_org_id(req);
    const user_id = parseInt(req.params.id as string, 10);
    if (!Number.isInteger(user_id)) {
      res.status(400).json({ error: "Invalid user id" });
      return;
    }
    await staff_services.reactivate_staff(organisation_id, user_id);
    res.status(200).json({ message: "Staff member reactivated" });
  } catch (e: any) {
    if (e.message === "organisation_id is required for admin") {
      res.status(400).json({ error: e.message });
      return;
    }
    if (e.message === "Staff member not found in this organisation") {
      res.status(404).json({ error: e.message });
      return;
    }
    next(e);
  }
};

export default {
  staff_list,
  create_new_staff,
  deactivate,
  reset_password,
  reactivate,
};
