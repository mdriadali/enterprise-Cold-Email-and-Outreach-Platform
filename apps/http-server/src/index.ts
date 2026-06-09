import express from "express";
import routes from "./presentation/routes";
import { serverEnv } from "@repo/env/server-env";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());
const port = serverEnv.HTTP_PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register all routes
app.use("/api/v1", routes);

app.listen(port, () => {
  console.log(`HTTP server running on port: ${port}`);
});