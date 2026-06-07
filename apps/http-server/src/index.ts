import express from "express";
import { env } from "@repo/env";
import routes from "./presentation/routes";

const app = express();
const port = env.HTTP_PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register all routes
app.use("/api/v1", routes);

app.listen(port, () => {
  console.log(`HTTP server running on port: ${port}`);
});