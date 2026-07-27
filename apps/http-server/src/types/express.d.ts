import type { User, workspaceMemberData } from "@repo/types";

declare global {
  namespace Express {
    interface Request {
      user: User;
       workspaceMember?: workspaceMemberData
    }
  }
}

export {};