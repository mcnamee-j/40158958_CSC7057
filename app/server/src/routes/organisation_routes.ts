import express from "express";
import organisation_controller from "../controllers/organisation_controller.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.get("/linked", authenticate, organisation_controller.get_linked_orgs);

export default router;
