import express from "express";
import admin_controller from "../controllers/admin_controller.js";
import authenticate from "../middleware/authenticate.js";
import authorise from "../middleware/authorise.js";

const router = express.Router();

router.get(
  "/overview",
  authenticate,
  authorise(["admin"]),
  admin_controller.get_overview,
);

export default router;
