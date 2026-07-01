export const PLAN_LIMITS = {
  STARTER: {
    workspaces: 1,
    members: 10,
    generationJobs: 30,
    campaigns: 60,
    apiKeys: 20,
    smtpAccounts: 5,
  },
  PROFESSIONAL: {
    workspaces: 5,
    members: 30,
    generationJobs: 300,
    campaigns: 30,
    apiKeys: 50,
    smtpAccounts: 20,
  },
  ULTRA: {
    workspaces: 20,
    members: 100,
    generationJobs: 5000,
    campaigns: 200,
    apiKeys: 200,
    smtpAccounts: 100,
  },
} as const;