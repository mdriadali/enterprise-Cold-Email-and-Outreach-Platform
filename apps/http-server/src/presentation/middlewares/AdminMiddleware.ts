import type { NextFunction, Request, Response } from "express";
import { AdminAccessDeniedError } from "../../domain/admin/AdminError";
import { AppError } from "../../domain/AppError";

export class AdminMiddleware {
    async execute(req: Request, res: Response, next: NextFunction) {
        try {
            const role = req.user?.role;
            if (role !== "ADMIN") {
                throw new AdminAccessDeniedError();
            }
            return next();
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(403).json({
                    message: error.message
                });
            }
            return res.status(500).json({
                message: "Internal Server Error"
            });
        }
    }
}
