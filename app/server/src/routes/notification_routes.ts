import express from "express";
import notification_controller from "../controllers/notification_controller.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.get("/", authenticate, notification_controller.list_notifications);
router.patch("/:id/read", authenticate, notification_controller.mark_read);
router.patch("/read-all", authenticate, notification_controller.mark_all_read);

export default router;
