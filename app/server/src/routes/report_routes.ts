import express from "express";
import report_controller from "../controllers/report_controller.js";
import authenticate from "../middleware/authenticate.js";
import authorise from "../middleware/authorise.js";
import { MANAGER_ROLES } from "../roles/roles.js";

const router = express.Router();

router.get(
  "/resolution-stats",
  authenticate,
  authorise(MANAGER_ROLES),
  report_controller.get_stats,
);

export default router;
