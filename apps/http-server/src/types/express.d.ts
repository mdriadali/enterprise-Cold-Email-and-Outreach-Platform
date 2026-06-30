import type { workspaceMemberData } from "@repo/types";
import type { User } from "../domain/user/User";

declare global {
  namespace Express {
    interface Request {
      user?: User;
       workspaceMember?: workspaceMemberData
    }
  }
}

export {};