import express from "express";
import staff_controller from "../controllers/staff_controller.js";
import authenticate from "../middleware/authenticate.js";
import authorise from "../middleware/authorise.js";

const router = express.Router();
const STAFF_ROLES = [
  "pharmacy_staff",
  "pharmacy_manager",
  "practice_staff",
  "practice_manager",
  "admin",
];
const MANAGER_ROLES = ["pharmacy_manager", "practice_manager", "admin"];

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

export default router;
