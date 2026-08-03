import type { CampaignEmailStatus, CampaignStatus, Subscription } from "./enums"
import type { LeadEmailData } from "./lead-types"

export interface Campaign {
    id: string
    workspaceId: string
    name: string
    description: string | null
    status: CampaignStatus
    timezone: string
    startAt: Date | null
    endAt: Date | null
    nextRunAt: Date | null
    dailyLimit: number
    sendingFromHour: number | null
    sendingToHour: number | null
    randomDelayMin: number | null
    randomDelayMax: number | null
    followUpEnabled: boolean
    stopOnReply: boolean
    stopOnBounce: boolean
    createdById: string
    smtpAccountId: string
    error: string | null
    createdAt: Date
    updatedAt: Date
}

export interface Workspace {
    id: string
    name: string
    ownerId: string
    subscription: Subscription
}

export interface CreateCampaignInput {
    workspaceId: string
    name: string
    description?: string

    // Scheduling
    timezone: string
    startAt: string
    endAt: string
    nextRunAt?: Date

    // Sending Rules
    dailyLimit: number
    sendingFromHour: number
    sendingToHour: number

    randomDelayMin: number

    // Options
    followUpEnabled: boolean
    stopOnReply: boolean
    stopOnBounce: boolean

    createdById: string

    //   followUps      CampaignFollowUpTemplate[]
    smtpAccountId: string

    generationJobId?: string

    emails?: LeadEmailData[]
}
export type CampaignData = Campaign & {
    workspace?: Workspace
    _count?: {
        campaignEmail: number
    }
}


export interface Updatecampaign {
    name?: string
    description?: string | null
    status?: CampaignStatus

    // Scheduling
    timezone?: string
    startAt?: Date | null
    endAt?: Date | null

    // Sending Rules
    dailyLimit?: number
    sendingFromHour?: number | null
    sendingToHour?: number | null

    nextRunAt?: Date | null

    randomDelayMin?: number | null
    randomDelayMax?: number | null

    // Options
    followUpEnabled?: boolean
    stopOnReply?: boolean
    stopOnBounce?: boolean

    createdById?: string

    //   followUps      CampaignFollowUpTemplate[]
    smtpAccountId?: string

    error?: string
}


export interface CampaignEmailCreateData {

    campaignId: string

    email: string
    subject: string
    greeting: string
    body: string
    signature?: string

    smtpId: string
}

export interface CampaingEmailData {
    id: string

    campaignId: string

    email: string

    subject: string
    greeting: string
    body: string
    signature?: string | null

    smtpId?: string | null

    stepNumber: number

    status: CampaignEmailStatus

    sentAt?: Date | null

    providerMessageId?: string | null

    errorMessage?: string | null

    opened?: number

    clicked?: number

    replied?: number

    bouncedAt?: Date | null

    createdAt: Date
    updatedAt: Date
}
