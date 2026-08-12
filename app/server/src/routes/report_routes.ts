import express from "express";
import report_controller from "../controllers/report_controller.js";
import authenticate from "../middleware/authenticate.js";
import authorise from "../middleware/authorise.js";

const router = express.Router();
const MANAGER_ROLES = ["pharmacy_manager", "practice_manager", "admin"];

router.get(
  "/resolution-stats",
  authenticate,
  authorise(MANAGER_ROLES),
  report_controller.get_stats,
);

export default router;
