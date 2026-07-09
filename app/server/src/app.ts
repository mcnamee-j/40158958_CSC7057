import express from "express";
import auth_Routes from "./routes/auth_routes.js";

const app = express();

app.use(express.json());

app.use("/api/auth", auth_Routes);

export default app;
