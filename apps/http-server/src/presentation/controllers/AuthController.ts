import type { Request, Response } from "express";
import { RegisterUseCase } from "../../application/use-cases/auth/RegisterUseCase";
import type { RegisterUserInput } from "@repo/types";


export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase
  ) { }

  register = async (req: Request, res: Response) => {
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

    return res.json({ sucess: true });
  };
}