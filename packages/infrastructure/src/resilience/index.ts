export {
  DependencyGuard,
  DependencyUnavailableError,
} from "./DependencyGuard";
export type { DependencyCheck } from "./DependencyGuard";

export { HealthMonitor } from "./HealthMonitor";
export type { HealthMonitorOptions } from "./HealthMonitor";

export { installShutdownHooks, registerShutdown } from "./shutdown";
export type { ShutdownHandler } from "./shutdown";

export { clearCrashState, registerStartAttempt, scheduleStabilityReset } from "./CrashLoopGuard";
export type { CrashLoopOptions } from "./CrashLoopGuard";
