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
router.get(
  "/organisations",
  authenticate,
  authorise(["admin"]),
  admin_controller.list_orgs,
);
router.post(
  "/organisations",
  authenticate,
  authorise(["admin"]),
  admin_controller.create_org,
);
router.get(
  "/organisation-links",
  authenticate,
  authorise(["admin"]),
  admin_controller.list_links,
);
router.post(
  "/organisation-links",
  authenticate,
  authorise(["admin"]),
  admin_controller.create_link,
);
router.patch(
  "/organisations/:id/deactivate",
  authenticate,
  authorise(["admin"]),
  admin_controller.deactivate_org,
);

export default router;
