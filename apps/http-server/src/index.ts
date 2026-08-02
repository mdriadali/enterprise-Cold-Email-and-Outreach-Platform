import express from "express";
import routes from "./presentation/routes";
import cookieParser from "cookie-parser";
import { serverEnv } from "@repo/env/server-env";
import { createServer } from "http"
import { Server } from "socket.io";
import compression from "compression";

const app = express();


const server = createServer(app)
const io = new Server(server)
// registerSocket(io);

const port = serverEnv.HTTP_PORT;


app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register all routes
app.use("/api/v1", routes);

server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});