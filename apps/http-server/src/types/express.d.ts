import type { User } from "../domain/user/User";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};