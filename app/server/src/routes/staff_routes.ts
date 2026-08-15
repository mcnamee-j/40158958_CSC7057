import express from "express";
import staff_controller from "../controllers/staff_controller.js";
import authenticate from "../middleware/authenticate.js";
import authorise from "../middleware/authorise.js";
import { MANAGER_ROLES, STAFF_ROLES } from "../roles/roles.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorise(STAFF_ROLES),
  staff_controller.staff_list,
);
router.post(
  "/",
  authenticate,
  authorise(MANAGER_ROLES),
  staff_controller.create_new_staff,
);
router.patch(
  "/:id/deactivate",
  authenticate,
  authorise(MANAGER_ROLES),
  staff_controller.deactivate,
);
router.post(
  "/:id/reset-password",
  authenticate,
  authorise(MANAGER_ROLES),
  staff_controller.reset_password,
);
router.patch(
  "/:id/reactivate",
  authenticate,
  authorise(MANAGER_ROLES),
  staff_controller.reactivate,
);

export default router;
