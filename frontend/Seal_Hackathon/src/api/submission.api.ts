import type { ISODateTime, UUID } from "@/types/common.types";

export type SubmissionLinkType =
  | "REPOSITORY"
  | "DEMO"
  | "SLIDE"
  | "REPORT"
  | "VIDEO"
  | "OTHER";

export type SubmissionStatus = "DRAFT" | "SUBMITTED" | "LATE" | "DISQUALIFIED" | string;

export type SubmissionStorageProvider =
  | "EXTERNAL_URL"
  | "GOOGLE_DRIVE"
  | "GITHUB"
  | "GITLAB"
  | "AWS_S3"
  | string;

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

export type UpdateSubmissionRequest = {
  note?: string;
  status?: string;
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
  roundId: UUID;
  status: SubmissionStatus;
  submissionNumber: number;
  submittedAt?: ISODateTime | null;
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

export type FileDownloadUrlResponse = {
  downloadUrl: string;
  expiresAt?: ISODateTime | null;
};

export type CriterionAverageScoreResponse = {
  eventCriteriaId: UUID;
  criteriaName: string;
  averageScore: number;
  maxScore: number;
};

export type TeamDetailedScoreResponse = {
  submissionId: UUID;
  teamId: UUID;
  totalScore: number;
  criteriaScores: CriterionAverageScoreResponse[];
};
