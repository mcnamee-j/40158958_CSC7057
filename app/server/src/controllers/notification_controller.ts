// Controllers validate request shape, delegate business logic to the
// service layer, and map known service error messages to HTTP status
// codes. Unexpected errors are passed to next(e) for centralised handling.

import type { Request, Response, NextFunction } from "express";
import notification_services from "../services/notification_services.js";

const list_notifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user_id = (req as any).user.userId;
    const notifications =
      await notification_services.get_notifications_user(user_id);
    res.status(200).json({ notifications });
  } catch (e) {
    next(e);
  }
};

const mark_read = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user_id = (req as any).user.userId;
    const notification_id = parseInt(req.params.id as string, 10);

    if (!Number.isInteger(notification_id)) {
      res.status(400).json({ error: "Invalid notification id" });
      return;
    }
    await notification_services.mark_notification_read(
      user_id,
      notification_id,
    );
    res.status(200).json({ message: "Notification marked as read" });
  } catch (e: any) {
    if (e.message === "Notification not found") {
      res.status(404).json({ error: "Notification not found" });
      return;
    }
    next(e);
  }
};

const mark_all_read = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user_id = (req as any).user.userId;
    await notification_services.mark_all_read(user_id);
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (e) {
    next(e);
  }
};

export default { list_notifications, mark_read, mark_all_read };
