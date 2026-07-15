import express from "express";
import auth_controller from "../controllers/auth_controller.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

//routes
router.post("/login", auth_controller.login);
router.post("/logout", authenticate, auth_controller.logout);
router.post("/refresh", auth_controller.refresh);
router.post("/fogot_password", auth_controller.forgot_password);
router.post("/reset_password", auth_controller.reset_password);

export default router;
