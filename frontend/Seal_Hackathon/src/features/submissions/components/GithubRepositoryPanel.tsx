import { useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import {
  githubApi,
  type GithubConnectionStatus,
  type GithubReference,
  type GithubRepository,
} from "@/api/github.api";
import { submissionApi } from "@/api/submission.api";
import type {
  RepositoryMetadata,
  SubmissionLinkResponse,
  SubmissionProviderAvailabilityResponse,
} from "@/types/submission.types";
import { filterTextFieldSx } from "../schemas/submissions.schema";

type ReferenceType = "BRANCH" | "TAG" | "COMMIT";

type Props = {
  teamId?: string;
  roundId?: string;
  canEdit: boolean;
  availability?: SubmissionProviderAvailabilityResponse;
  existingLink?: SubmissionLinkResponse;
  onSaved: () => void | Promise<void>;
  onError: (message: string) => void;
};

function requestMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function existingMetadata(link?: SubmissionLinkResponse) {
  return link?.repoMetadata && typeof link.repoMetadata === "object"
    ? (link.repoMetadata as RepositoryMetadata)
    : undefined;
}

export function GithubRepositoryPanel({
  teamId,
  roundId,
  canEdit,
  availability,
  existingLink,
  onSaved,
  onError,
}: Props) {
  const metadata = existingMetadata(existingLink);
  const [status, setStatus] = useState<GithubConnectionStatus | null>(null);
  const [repositories, setRepositories] = useState<GithubRepository[]>([]);
  const [references, setReferences] = useState<GithubReference[]>([]);
  const [repositoryKey, setRepositoryKey] = useState(
    metadata?.owner && metadata.repository
      ? `${metadata.owner}/${metadata.repository}`
      : metadata?.repoName || "",
  );
  const [referenceType, setReferenceType] = useState<ReferenceType>(
    metadata?.referenceType === "TAG" || metadata?.referenceType === "COMMIT"
      ? metadata.referenceType
      : "BRANCH",
  );
  const [reference, setReference] = useState(metadata?.selectedReference || "");
  const [label, setLabel] = useState(existingLink?.label || "");
  const [includePrivate, setIncludePrivate] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingRepositories, setLoadingRepositories] = useState(false);
  const [loadingReferences, setLoadingReferences] = useState(false);
  const [action, setAction] = useState<
    "connect" | "disconnect" | "save" | null
  >(null);

  const configured = availability?.available === true;
  const selectedRepository = useMemo(
    () => repositories.find((repository) => repository.fullName === repositoryKey),
    [repositories, repositoryKey],
  );

  useEffect(() => {
    if (!configured) {
      queueMicrotask(() => setLoadingStatus(false));
      return;
    }
    let active = true;
    githubApi
      .getStatus()
      .then((result) => {
        if (active) setStatus(result);
      })
      .catch((error: unknown) => {
        if (active) onError(requestMessage(error, "GitHub status could not be loaded."));
      })
      .finally(() => {
        if (active) setLoadingStatus(false);
      });
    return () => {
      active = false;
    };
  }, [configured, onError]);

  useEffect(() => {
    if (!status?.connected) return;
    let active = true;
    queueMicrotask(() => {
      if (active) setLoadingRepositories(true);
    });
    githubApi
      .getRepositories()
      .then((result) => {
        if (active) setRepositories(result);
      })
      .catch((error: unknown) => {
        if (active) onError(requestMessage(error, "Repositories could not be loaded."));
      })
      .finally(() => {
        if (active) setLoadingRepositories(false);
      });
    return () => {
      active = false;
    };
  }, [status?.connected, onError]);

  useEffect(() => {
    if (!status?.connected || !selectedRepository || referenceType === "COMMIT") {
      return;
    }
    let active = true;
    queueMicrotask(() => {
      if (active) setLoadingReferences(true);
    });
    const request = referenceType === "TAG"
      ? githubApi.getTags(selectedRepository.owner, selectedRepository.name)
      : githubApi.getBranches(selectedRepository.owner, selectedRepository.name);
    request
      .then((result) => {
        if (!active) return;
        setReferences(result);
        setReference((current) => {
          if (result.some((item) => item.name === current)) return current;
          if (referenceType === "BRANCH" && selectedRepository.defaultBranch) {
            return selectedRepository.defaultBranch;
          }
          return result[0]?.name || "";
        });
      })
      .catch((error: unknown) => {
        if (active) onError(requestMessage(error, "Repository references could not be loaded."));
      })
      .finally(() => {
        if (active) setLoadingReferences(false);
      });
    return () => {
      active = false;
    };
  }, [status?.connected, selectedRepository, referenceType, onError]);

  const handleConnect = async () => {
    setAction("connect");
    try {
      const start = await githubApi.connect(window.location.pathname, includePrivate);
      window.location.assign(start.authorizationUrl);
    } catch (error) {
      onError(requestMessage(error, "GitHub connection could not start."));
      setAction(null);
    }
  };

  const handleDisconnect = async () => {
    setAction("disconnect");
    try {
      await githubApi.disconnect();
      setStatus((current) => current ? { ...current, connected: false } : current);
      setRepositories([]);
      setReferences([]);
    } catch (error) {
      onError(requestMessage(error, "GitHub could not be disconnected."));
    } finally {
      setAction(null);
    }
  };

  const handleSave = async () => {
    if (!teamId || !roundId || !selectedRepository || !reference.trim()) {
      onError("Choose a repository and branch, tag, or commit before saving.");
      return;
    }
    setAction("save");
    try {
      await submissionApi.selectGithubRepository(teamId, roundId, {
        owner: selectedRepository.owner,
        repository: selectedRepository.name,
        reference: reference.trim(),
        referenceType,
        label: label.trim() || undefined,
        isPrimary: true,
        displayOrder: existingLink?.displayOrder ?? 0,
      });
      await onSaved();
    } catch (error) {
      onError(requestMessage(error, "GitHub repository could not be saved."));
    } finally {
      setAction(null);
    }
  };

  if (!configured) {
    return <Alert severity="info">{availability?.message || "GitHub is not configured."}</Alert>;
  }
  if (loadingStatus) return <p className="text-sm text-slate-500">Loading GitHub status...</p>;

  if (!status?.connected) {
    return (
      <div className="space-y-4">
        <Alert severity="info">
          Connect GitHub separately from sign-in. Public repository access does not request
          private repository permissions.
        </Alert>
        <FormControlLabel
          control={(
            <Checkbox
              checked={includePrivate}
              onChange={(event) => setIncludePrivate(event.target.checked)}
            />
          )}
          label="Include private repositories"
        />
        {includePrivate && (
          <Alert severity="warning">
            GitHub OAuth Apps cannot request read-only private-code access. Continuing requests
            the broad repo scope. Grant it only if this submission needs a private repository.
          </Alert>
        )}
        <Button
          variant="contained"
          disabled={!canEdit || action === "connect"}
          onClick={handleConnect}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          {action === "connect" ? "Connecting..." : "Connect GitHub"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Alert severity="success">
        GitHub connected{status.accountEmail ? ` as ${status.accountEmail}` : ""}.
        {status.privateRepositoriesGranted
          ? " Private repository access is granted."
          : " Public repositories only."}
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          select
          label="Repository"
          value={repositoryKey}
          disabled={!canEdit || loadingRepositories || action !== null}
          onChange={(event) => {
            setRepositoryKey(event.target.value);
            setReference("");
          }}
          helperText={loadingRepositories ? "Loading repositories..." : "Only accessible repositories are listed."}
          sx={filterTextFieldSx}
        >
          {repositories.map((repository) => (
            <MenuItem
              key={repository.fullName}
              value={repository.fullName}
              disabled={repository.archived || repository.disabled}
            >
              {repository.fullName} ({repository.visibility})
              {repository.archived ? " — archived" : ""}
              {repository.disabled ? " — disabled" : ""}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Reference type"
          value={referenceType}
          disabled={!canEdit || action !== null}
          onChange={(event) => {
            setReferenceType(event.target.value as ReferenceType);
            setReference("");
          }}
          sx={filterTextFieldSx}
        >
          <MenuItem value="BRANCH">Branch</MenuItem>
          <MenuItem value="TAG">Tag</MenuItem>
          <MenuItem value="COMMIT">Commit SHA</MenuItem>
        </TextField>

        {referenceType === "COMMIT" ? (
          <TextField
            label="Commit SHA"
            value={reference}
            disabled={!canEdit || action !== null}
            onChange={(event) => setReference(event.target.value)}
            helperText="Final submission freezes the resolved immutable commit."
            sx={filterTextFieldSx}
          />
        ) : (
          <TextField
            select
            label={referenceType === "TAG" ? "Tag" : "Branch"}
            value={reference}
            disabled={!canEdit || !selectedRepository || loadingReferences || action !== null}
            onChange={(event) => setReference(event.target.value)}
            helperText={loadingReferences ? "Loading references..." : "Sync latest resolves this ref again."}
            sx={filterTextFieldSx}
          >
            {references.map((item) => (
              <MenuItem key={item.name} value={item.name}>
                {item.name}{item.protectedBranch ? " — protected" : ""}
              </MenuItem>
            ))}
          </TextField>
        )}

        <TextField
          label="Display label"
          value={label}
          disabled={!canEdit || action !== null}
          onChange={(event) => setLabel(event.target.value)}
          slotProps={{ htmlInput: { maxLength: 200 } }}
          placeholder={selectedRepository?.fullName || "Final repository"}
          sx={filterTextFieldSx}
        />
      </div>

      {metadata?.commitSha && (
        <Alert severity="info">
          Current snapshot: {metadata.selectedReference || "ref"} @ {metadata.commitSha.slice(0, 12)}
        </Alert>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          variant="contained"
          disabled={!canEdit || !selectedRepository || !reference.trim() || action !== null}
          onClick={handleSave}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          {action === "save"
            ? "Synchronizing..."
            : metadata?.commitSha
              ? "Sync latest"
              : "Use this repository"}
        </Button>
        <Button
          color="inherit"
          disabled={action !== null}
          onClick={handleDisconnect}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          {action === "disconnect" ? "Disconnecting..." : "Disconnect"}
        </Button>
      </div>
    </div>
  );
}
