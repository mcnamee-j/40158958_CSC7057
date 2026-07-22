import express from "express";
import query_controller from "../controllers/query_controller.js";
import authenticate from "../middleware/authenticate.js";
import authorise from "../middleware/authorise.js";

const router = express.Router();

const ALLOWED_QUERY_ROLES = [
  "pharmacy_staff",
  "pharmacy_manager",
  "practice_staff",
  "practice_manager",
];

router.post(
  "/",
  authenticate,
  authorise(ALLOWED_QUERY_ROLES),
  query_controller.create_query,
);
router.get(
  "/",
  authenticate,
  authorise(ALLOWED_QUERY_ROLES),
  query_controller.list_queries,
);
router.get(
  "/:id",
  authenticate,
  authorise(ALLOWED_QUERY_ROLES),
  query_controller.get_query,
);
router.post(
  "/:id/replies",
  authenticate,
  authorise(ALLOWED_QUERY_ROLES),
  query_controller.reply_to_query,
);
router.patch(
  "/:id/status",
  authenticate,
  authorise(ALLOWED_QUERY_ROLES),
  query_controller.update_query_status,
);
router.patch(
  "/:id/assign",
  authenticate,
  authorise(ALLOWED_QUERY_ROLES),
  query_controller.assign_query_to_user,
);

export default router;
