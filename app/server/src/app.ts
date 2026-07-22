import express from "express";
import auth_Routes from "./routes/auth_routes.js";
import error_handler from "./middleware/error_handler.js";
import query_routes from "./routes/query_routes.js";

const app = express();

app.use(express.json());

app.use("/api/auth", auth_Routes);
app.use("/api/queries", query_routes);

app.use(error_handler);

export default app;
