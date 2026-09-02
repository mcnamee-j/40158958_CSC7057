import express from "express";
import auth_controller from "../controllers/auth_controller.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

// login, refresh, forgot/reset password are public, others require a valid access token
router.post("/login", auth_controller.login);
router.post("/logout", authenticate, auth_controller.logout);
router.post("/refresh", auth_controller.refresh);
router.post("/forgot_password", auth_controller.forgot_password);
router.post("/reset_password", auth_controller.reset_password);
router.get("/get_user", authenticate, auth_controller.get_user);
router.patch("/update", authenticate, auth_controller.update_user);

export default router;
