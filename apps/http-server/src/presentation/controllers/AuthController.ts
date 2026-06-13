import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { LoginUserInput, RegisterUserInput } from "@repo/types";
import type { RegisterUserUseCase } from "../../application/use-cases/auth/RegisterUser-UseCase";
import type { LoginUserUseCase } from "../../application/use-cases/auth/LoginUser-UseCase";
import type { LogoutUserUseCase } from "../../application/use-cases/auth/Logoutuser-useCase";
import { AppError } from "../../domain/AppError";
import type { RefreshUseCase } from "../../application/use-cases/auth/Refresh-UseCase";


export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly logoutUserUseCase: LogoutUserUseCase,
    private readonly refreshUseCase: RefreshUseCase,
  ) { }

  register = async (req: Request, res: Response) => {
    try {
      const data: RegisterUserInput = req.body;
      const deviceInfo = {
        devicename: req.headers["x-device-name"],
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      }
      const result = await this.registerUseCase.execute({ ...data, deviceInfo });

      res.cookie(
        "accessToken",
        result.accessToken
      );

      res.cookie(
        "refreshToken",
        result.refreshToken.token
      );

      return res.status(200).json({ sucess: true });
    } catch (error) {

      if (error instanceof AppError) {
        return res.status(400).json({
          massage: error.message
        })
      }

      console.error("[Register] internal server error",error)

      return res.status(500).json({
        message: "Internal Server Error"
      })
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      console.log("[LOGIN] Request received");
      const loginData: LoginUserInput = req.body
      const deviceInfo = {
        devicename: req.headers["x-device-name"],
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      }
      const result = await this.loginUserUseCase.execute({ ...loginData, deviceInfo })
      res.cookie(
        "accessToken",
        result.accessToken
      )
      res.cookie(
        "refreshToken",
        result.refreshToken.token
      )
      console.log("[Login] cookie send sucessfully")
      return res.status(200).json({ sucess: true })
    } catch (error: unknown) {

      if (error instanceof AppError) {
        return res.status(400).json({
          message: error.message
        })
      }
      console.error("[Login] internal server error",error)
      return res.status(500).json({
        message: "Internal Server Error"
      });
    }
  }

  logout = async (req: Request, res: Response) => {
    try {
      console.log("[Logout]Request recived")
      const userId = req.user.id
      const token = req.cookies.refreshToken
      await this.logoutUserUseCase.execute(userId, token)
      res.cookie(
        "accessToken",
        ""
      )
      res.cookie(
        "refreshToken",
        ""
      )
      console.log("[Logout] user sucessfully")
      return res.status(200).json({ sucess: true })
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(400).json({
          message: error.message
        })
      }
      console.error("[Logout] internal server error")
      return res.status(500).json({
        message:  "Internal server error"
      });
    }
  }

  refresh = async (req: Request, res: Response) => {
    try {
      console.log("[Refresh] request Recived")
      const refreshToken = req.cookies.refreshToken
      const result = await this.refreshUseCase.execute(refreshToken)
      res.cookie(
        "accessToken",
        result.accessToken
      )
      console.log("[Refresh] access Token Send sucessfully")
      return res.status(200).json({ sucess: true })
    } catch (error) {

      if (error instanceof jwt.TokenExpiredError) {
        return res.status(402).json({
          code: "TOKEN_EXPIRED"
        })
      }
      if (error instanceof AppError) {
        return res.status(402).json({
          message: error.message
        })
      }

      console.error("[Refresh] Internal server error",error)

      return res.status(500).json({
        massage: "Internal Server Error"
      })
    }

  }
}