import express, { type NextFunction, type Request, type Response, } from "express";
import routes from "./presentation/routes";
import cookieParser from "cookie-parser";
import { serverEnv } from "@repo/env/server-env";
import { createServer } from "http";
import { Server } from "socket.io";
import compression from "compression";
import { logger } from "./logger";

const app = express();

const server = createServer(app);
const io = new Server(server);

// registerSocket(io);

const port = serverEnv.HTTP_PORT;


// Global Middlewares

app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request + Response Logger


app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  //Request coming
  logger.info(
    {
      method: req.method,
      url: req.originalUrl,
    },
    "Incoming request",
  );

  // Response 
  res.on("finish", () => {
    const duration = Date.now() - start;

    logger.info(
      {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      },
      "Request completed",
    );
  });

  next();
});

// Health Check


app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});


// Register Routes

app.use("/api/v1", routes);


// Global Error Handler

app.use(
  (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    logger.error(
      {
        method: req.method,
        url: req.originalUrl,
        err,
      },
      "Request failed",
    );

    res.status(500).json({
      message: "Internal Server Error",
    });
  },
);


// Start Server


server.listen(port, () => {
  logger.info(
    {
      port,
    },
    "Server started",
  );
});