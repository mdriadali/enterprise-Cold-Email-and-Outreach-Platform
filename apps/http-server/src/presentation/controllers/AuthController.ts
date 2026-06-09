import type { Request, Response } from "express";

import type { LoginUserInput, RegisterUserInput } from "@repo/types";
import type { RegisterUserUseCase } from "../../application/use-cases/auth/RegisterUser-UseCase";
import type { LoginUserUseCase } from "../../application/use-cases/auth/LoginUser-UseCase";


export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase
  ) { }

  register = async (req: Request, res: Response) => {
    try {
      const data: RegisterUserInput = req.body;
      const result = await this.registerUseCase.execute(data);

      res.cookie(
        "accessToken",
        result.accessToken
      );

      res.cookie(
        "refreshToken",
        result.refreshToken
      );

      return res.status(200).json({ sucess: true });
    } catch (error) {
      return res.status(500).json({
        message: error instanceof Error ? error.message : "somthing went wrong"
      });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      console.log("[LOGIN] Request received");
      const loginData: LoginUserInput = req.body
      const result = await this.loginUserUseCase.execute(loginData)
      res.cookie(
        "accessToken",
        result.accessToken
      )
      res.cookie(
        "refreshToken",
        result.refreshToken
      )

      return res.status(200).json({ sucess: true })
    } catch (error: unknown) {
      return res.status(500).json({
        message: error instanceof Error ? error.message : "somthing went wrong"
      });
    }
  }
}