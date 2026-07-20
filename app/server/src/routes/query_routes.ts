import express from "express";
import query_controller from "../controllers/query_controller.js";
import authenticate from "../middleware/authenticate.js";
import authorise from "../middleware/authorise.js";

const router = express.Router();

const CAN_CREATE_QUERY = [
  "pharmacy_staff",
  "pharmacy_manager",
  "practice_staff",
  "practice_manager",
];

router.post(
  "/",
  authenticate,
  authorise(CAN_CREATE_QUERY),
  query_controller.create_query,
);

export default router;
