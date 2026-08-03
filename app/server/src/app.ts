import express from "express";
import cors from "cors";
import auth_Routes from "./routes/auth_routes.js";
import error_handler from "./middleware/error_handler.js";
import query_routes from "./routes/query_routes.js";
import organisation_routes from "./routes/organisation_routes.js";
import notification_routes from "./routes/notification_routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/auth", auth_Routes);
app.use("/api/queries", query_routes);
app.use("/api/organisations", organisation_routes);
app.use("/api/notifications", notification_routes);

app.use(error_handler);

export default app;
