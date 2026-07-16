import { apiRequest } from "@/api/apiRequest";
import type { ISODateTime } from "@/types/common.types";

export type GithubConnectionStatus = {
  available: boolean;
  availabilityMessage: string;
  connected: boolean;
  accountId?: string | null;
  accountEmail?: string | null;
  privateRepositoriesGranted: boolean;
  connectedAt?: ISODateTime | null;
};

export type GithubOAuthStart = {
  authorizationUrl: string;
  expiresAt: ISODateTime;
};

export type GithubRepository = {
  owner: string;
  name: string;
  fullName: string;
  htmlUrl: string;
  defaultBranch?: string | null;
  visibility: "public" | "private" | "internal" | string;
  primaryLanguage?: string | null;
  pushedAt?: ISODateTime | null;
  privateRepository: boolean;
  archived: boolean;
  disabled: boolean;
};

export type GithubReference = {
  name: string;
  commitSha: string;
  protectedBranch: boolean;
};

const repositoryPath = (owner: string, repository: string) =>
  `/integrations/github/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`;

export const githubApi = {
  getStatus() {
    return apiRequest.get<GithubConnectionStatus>("/integrations/github/status");
  },

  connect(returnPath: string, includePrivateRepositories: boolean) {
    return apiRequest.post<GithubOAuthStart>(
      "/integrations/github/connect",
      undefined,
      { params: { returnPath, includePrivateRepositories } },
    );
  },

  disconnect() {
    return apiRequest.delete<void>("/integrations/github/connection");
  },

  getRepositories(page = 1, size = 50) {
    return apiRequest.get<GithubRepository[]>("/integrations/github/repositories", {
      params: { page, size },
    });
  },

  getBranches(owner: string, repository: string, page = 1, size = 100) {
    return apiRequest.get<GithubReference[]>(
      `${repositoryPath(owner, repository)}/branches`,
      { params: { page, size } },
    );
  },

  getTags(owner: string, repository: string, page = 1, size = 100) {
    return apiRequest.get<GithubReference[]>(
      `${repositoryPath(owner, repository)}/tags`,
      { params: { page, size } },
    );
  },
};
