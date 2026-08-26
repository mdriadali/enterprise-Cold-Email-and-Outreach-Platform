import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { ForgotPasswordInput, LoginUserInput, RegisterUserInput, ResetPasswordInput, VerifyEmailInput } from "@repo/types";
import type { RegisterUserUseCase } from "../../application/use-cases/auth/RegisterUser-UseCase";
import type { LoginUserUseCase } from "../../application/use-cases/auth/LoginUser-UseCase";
import type { LogoutUserUseCase } from "../../application/use-cases/auth/Logoutuser-useCase";
import { AppError } from "../../domain/AppError";
import type { RefreshUseCase } from "../../application/use-cases/auth/Refresh-UseCase";
import type { VerifyEmailUseCase } from "../../application/use-cases/auth/VerifyEmail-UseCase";
import type { ForgotPasswordUseCase } from "../../application/use-cases/auth/ForgotPassword-UseCase";
import type { ResetPasswordUseCase } from "../../application/use-cases/auth/ResetPassword-UseCase";


export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly logoutUserUseCase: LogoutUserUseCase,
    private readonly refreshUseCase: RefreshUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
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

      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000, 
        sameSite: "lax",
        secure: false
      });

      res.cookie("refreshToken", result.refreshToken.token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, 
        sameSite: "lax",
        secure: false
      });

      return res.status(200).json({ sucess: true });
    } catch (error) {

      if (error instanceof AppError) {
        return res.status(400).json({
          massage: error.message
        })
      }

      return res.status(500).json({
        message: "Internal Server Error"
      })
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const loginData: LoginUserInput = req.body
      const deviceInfo = {
        devicename: req.headers["x-device-name"],
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      }
      const result = await this.loginUserUseCase.execute({ ...loginData, deviceInfo })

      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
        sameSite: "lax",
        secure: false
      });

      res.cookie("refreshToken", result.refreshToken.token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: "lax",
        secure: false
      });
      return res.status(200).json({ sucess: true })
    } catch (error: unknown) {

      if (error instanceof AppError) {
        return res.status(400).json({
          message: error.message
        })
      }
      return res.status(500).json({
        message: "Internal Server Error"
      });
    }
  }

  logout = async (req: Request, res: Response) => {
    try {
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
      return res.status(200).json({ sucess: true })
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(400).json({
          message: error.message
        })
      }
      return res.status(500).json({
        message: "Internal server error"
      });
    }
  }

  refresh = async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken
      const result = await this.refreshUseCase.execute(refreshToken)
      res.cookie(
        "accessToken",
        result.accessToken,
         {
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
        sameSite: "lax",
        secure: false
      }
      )
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

      return res.status(500).json({
        massage: "Internal Server Error"
      })
    }

  }

  verifyEmail = async (req: Request, res: Response) => {
    try {
      const data: VerifyEmailInput = req.body
      await this.verifyEmailUseCase.execute(data)
      return res.status(200).json({ sucess: true })
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(400).json({ message: error.message })
      }
      return res.status(500).json({ message: "Internal Server Error" })
    }
  }

  forgotPassword = async (req: Request, res: Response) => {
    try {
      const data: ForgotPasswordInput = req.body
      await this.forgotPasswordUseCase.execute(data)
      return res.status(200).json({ sucess: true })
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(400).json({ message: error.message })
      }
      return res.status(500).json({ message: "Internal Server Error" })
    }
  }

  resetPassword = async (req: Request, res: Response) => {
    try {
      const data: ResetPasswordInput = req.body
      await this.resetPasswordUseCase.execute(data)
      return res.status(200).json({ sucess: true })
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(400).json({ message: error.message })
      }
      return res.status(500).json({ message: "Internal Server Error" })
    }
  }
}
