import type { Subscription } from "@repo/db";
import { PLAN_LIMITS } from "./PlanLimits";

export class PlanService {
  static getLimits(subscription: Subscription) {
    return PLAN_LIMITS[subscription];
  }
}