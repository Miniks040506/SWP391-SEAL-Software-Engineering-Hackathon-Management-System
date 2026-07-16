import type { ISODateTime, UUID } from "@/types/common.types";

export type SubmissionLinkType =
  | "REPOSITORY"
  | "DEMO"
  | "SLIDE"
  | "REPORT"
  | "VIDEO"
  | "OTHER";

export type SubmissionStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "LATE"
  | "DISQUALIFIED"
  | string;

export type SubmissionStorageProvider =
  | "EXTERNAL_URL"
  | "GOOGLE_DRIVE"
  | "GITHUB"
  | "GITLAB"
  | "AWS_S3"
  | string;

export type SubmissionInputSource =
  | "URL"
  | "LOCAL_FILE"
  | "GOOGLE_DRIVE"
  | "GITHUB";

export type SubmissionBlockedReason =
  | "NONE"
  | "NOT_TEAM_LEADER"
  | "TRACK_NOT_ASSIGNED"
  | "TEAM_REGISTRATION_NOT_APPROVED"
  | "TEAM_ELIMINATED"
  | "TEAM_STATUS_NOT_ELIGIBLE"
  | "MISSING_REQUIRED_TYPES"
  | "ROUND_NOT_OPEN"
  | "ROUND_SUBMISSION_LOCKED"
  | "ROUND_SUBMISSION_DEADLINE_EXCEEDED";

export type RepositoryMetadata = {
  platform?: string;
  repoName?: string;
  owner?: string;
  defaultBranch?: string;
  primaryLanguage?: string;
  lastPushAt?: ISODateTime;
  stars?: number;
  forks?: number;
  isPrivate?: boolean;
  url?: string;
  error?: string;
  [key: string]: unknown;
};

export type CreateSubmissionLinkRequest = {
  linkType: SubmissionLinkType | string;
  url: string;
  label?: string;
  isPrimary?: boolean;
  displayOrder?: number;
};

export type SubmitDeliverablesRequest = {
  note?: string;
  links: CreateSubmissionLinkRequest[];
};

export type SaveSubmissionDraftRequest = {
  note?: string;
  links?: CreateSubmissionLinkRequest[];
};

export type UpdateSubmissionRequest = {
  note?: string;
  status?: SubmissionStatus | string;
  links?: CreateSubmissionLinkRequest[];
};

export type UpdateSubmissionLinkRequest = {
  linkType?: SubmissionLinkType | string;
  url?: string;
  label?: string;
  isPrimary?: boolean;
  displayOrder?: number;
};

export type SubmissionResponse = {
  id: UUID;
  teamId: UUID;
  teamName?: string | null;
  trackId?: UUID | null;
  trackName?: string | null;
  roundId: UUID;
  roundName?: string | null;
  note?: string | null;
  status: SubmissionStatus;
  submissionNumber: number;
  submittedAt?: ISODateTime | null;
  updatedAt?: ISODateTime | null;
  roundSubmissionLocked?: boolean | null;
  roundSubmissionLockedAt?: ISODateTime | null;
  links?: SubmissionLinkResponse[];
};

export type SubmissionSummaryResponse = {
  id: UUID;
  teamId: UUID;
  teamName?: string | null;
  trackId?: UUID | null;
  trackName?: string | null;
  roundId: UUID;
  roundName: string;
  status: SubmissionStatus;
  submissionNumber: number;
  submittedAt?: ISODateTime | null;
  updatedAt?: ISODateTime | null;
  roundSubmissionLocked?: boolean | null;
  roundSubmissionLockedAt?: ISODateTime | null;
  linkCount?: number;
};

export type SubmissionLinkResponse = {
  id: UUID;
  submissionId?: UUID;
  linkType: SubmissionLinkType | string;
  url: string;
  label?: string | null;
  storageProvider?: SubmissionStorageProvider | null;
  objectKey?: string | null;
  originalFileName?: string | null;
  contentType?: string | null;
  fileSizeBytes?: number | null;
  repoMetadata?: RepositoryMetadata | null;
  isPrimary?: boolean;
  displayOrder?: number | null;
  createdAt?: ISODateTime | null;
  updatedAt?: ISODateTime | null;
};

export type SubmissionDetailResponse = {
  id: UUID;
  eventId?: UUID | null;
  eventName?: string | null;
  teamId: UUID;
  teamName?: string | null;
  leaderId?: UUID | null;
  leaderName?: string | null;
  trackId?: UUID | null;
  trackName?: string | null;
  roundId: UUID;
  roundName?: string | null;
  note?: string | null;
  status: SubmissionStatus;
  submissionNumber: number;
  submittedAt?: ISODateTime | null;
  updatedAt?: ISODateTime | null;
  roundSubmissionLocked?: boolean | null;
  roundSubmissionLockedAt?: ISODateTime | null;
  links: SubmissionLinkResponse[];
};

export type SubmissionRequirementItemResponse = {
  type: SubmissionLinkType;
  label: string;
  required: boolean;
  allowedSources: SubmissionInputSource[];
  primary: boolean;
  displayOrder: number;
  satisfied: boolean;
  satisfiedByLinkIds: UUID[];
};

export type SubmissionUploadPolicyResponse = {
  acceptedMimeTypes: string[];
  acceptedExtensions: string[];
  maximumFileSizeBytes: number;
  maximumFiles: number;
};

export type SubmissionProviderAvailabilityResponse = {
  source: SubmissionInputSource;
  available: boolean;
  message?: string | null;
};

export type SubmissionRequirementsResponse = {
  eventId?: UUID | null;
  eventName?: string | null;
  trackId?: UUID | null;
  trackName?: string | null;
  teamId: UUID;
  teamName: string;
  roundId: UUID;
  roundName: string;
  roundInstructions?: string | null;
  roundStatus: string;
  submissionDeadline?: ISODateTime | null;
  submissionLocked: boolean;
  submissionLockedAt?: ISODateTime | null;
  canView: boolean;
  canEdit: boolean;
  canSubmit: boolean;
  blockedReason: SubmissionBlockedReason;
  blockedMessage?: string | null;
  requirements: SubmissionRequirementItemResponse[];
  uploadPolicy: SubmissionUploadPolicyResponse;
  providerAvailability: SubmissionProviderAvailabilityResponse[];
  currentSubmission?: SubmissionResponse | null;
  satisfiedTypes: SubmissionLinkType[];
  missingRequiredTypes: SubmissionLinkType[];
};

export type FileDownloadUrlResponse = {
  downloadUrl: string;
  expiresAt?: ISODateTime | null;
};

export type CoordinatorSubmissionSummaryResponse = {
  id: UUID;
  eventId?: UUID | null;
  eventName?: string | null;
  teamId: UUID;
  teamName?: string | null;
  trackId?: UUID | null;
  trackName?: string | null;
  roundId: UUID;
  roundName: string;
  status: SubmissionStatus;
  submissionNumber: number;
  submittedAt?: ISODateTime | null;
  updatedAt?: ISODateTime | null;
  roundSubmissionLocked?: boolean | null;
  roundSubmissionLockedAt?: ISODateTime | null;
  linkCount: number;
  late?: boolean;
};

export type SubmissionLockErrorCode = "ROUND_SUBMISSION_LOCKED";

export type GetEventSubmissionsParams = {
  eventId?: UUID;
  roundId?: UUID;
  trackId?: UUID;
  status?: SubmissionStatus | string;
  search?: string;
  page?: number;
  size?: number;
};

export type CriterionAverageScoreResponse = {
  eventCriteriaId: UUID;
  criteriaName: string;
  category?: string | null;
  technical?: boolean | null;
  averageScore: number;
  maxScore?: number | null;
  weight?: number | null;
  judgeCount: number;
};

export type TeamDetailedScoreResponse = {
  eventId: UUID;
  eventName: string;
  teamId: UUID;
  teamName: string;
  submissionId: UUID;
  roundId: UUID;
  roundName: string;
  trackId: UUID;
  trackName: string;
  totalScore: number;
  rankPosition: number;
  advanced: boolean;
  judgeCount: number;
  publishedAt?: ISODateTime | null;
  criteriaScores: CriterionAverageScoreResponse[];
};

// Added more
export type SubmissionHistoryEntry = {
  id: string;
  submissionNumber: number;
  status: string;
  submittedAt: string | null;
  linkCount: number;
  note?: string;
};

export type RequiredLinkConfig = {
  linkType: string;
  label: string;
  isRequired: boolean;
  isPrimary: boolean;
};

export type LinkFieldValue = {
  linkType: string;
  label: string;
  url: string;
  file?: File | null;
  inputType: "url" | "file";
  isPrimary: boolean;
  isRequired: boolean;
  linkId?: string;
};
