import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useMemo, useState } from "react";

import { criteriaApi } from "@/api/criteria.api";
import { SCORING_CRITERIA_PAGE_SIZE } from "@/features/criteria/constants/criteriaUi";
import {
  booleanFilterToParam,
  getCriteriaErrorMessage,
} from "@/features/criteria/utils/criteriaView";
import type { UUID } from "@/types/common.types";
import type {
  BooleanFilterValue,
  CriteriaFilterValue,
  ScoringCriteriaDialogState,
  ScoringCriteriaResponse,
} from "@/types/criteria.types";

export function useScoringCriteriaManagement() {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<CriteriaFilterValue>("ALL");
  const [active, setActive] = useState<BooleanFilterValue>("ALL");
  const [technical, setTechnical] = useState<BooleanFilterValue>("ALL");
  const [page, setPage] = useState(0);
  const [dialogState, setDialogState] =
    useState<ScoringCriteriaDialogState | null>(null);

  const criteriaQuery = useQuery({
    queryKey: ["scoring-criteria", category, active, technical, page],
    queryFn: () =>
      criteriaApi.getScoringCriteria({
        category: category === "ALL" ? undefined : category,
        isActive: booleanFilterToParam(active),
        isTechnical: booleanFilterToParam(technical),
        page,
        size: SCORING_CRITERIA_PAGE_SIZE,
      }),
  });

  const activateMutation = useMutation({
    mutationFn: (criteria: ScoringCriteriaResponse) =>
      criteria.isActive
        ? criteriaApi.deactivateScoringCriteria(criteria.id)
        : criteriaApi.activateScoringCriteria(criteria.id),
    onSuccess: async (_, criteria) => {
      enqueueSnackbar(criteria.isActive ? "Criteria deactivated." : "Criteria activated.", {
        variant: "success",
      });
      await queryClient.invalidateQueries({ queryKey: ["scoring-criteria"] });
    },
    onError: (error) =>
      enqueueSnackbar(getCriteriaErrorMessage(error, "Failed to update criteria status."), {
        variant: "error",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (criteriaId: UUID) => criteriaApi.deleteScoringCriteria(criteriaId),
    onSuccess: async () => {
      enqueueSnackbar("Criteria deleted or deactivated if already used.", {
        variant: "success",
      });
      await queryClient.invalidateQueries({ queryKey: ["scoring-criteria"] });
    },
    onError: (error) =>
      enqueueSnackbar(getCriteriaErrorMessage(error, "Failed to delete criteria."), {
        variant: "error",
      }),
  });

  const pageData = criteriaQuery.data;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const criteria = pageData?.content ?? [];

  const totals = useMemo(() => {
    const technicalCount = criteria.filter((item) => item.isTechnical).length;
    return {
      total: pageData?.totalElements ?? 0,
      technical: technicalCount,
      soft: criteria.length - technicalCount,
    };
  }, [criteria, pageData?.totalElements]);

  const resetPageAndSet = <T,>(setter: (value: T) => void, value: T) => {
    setter(value);
    setPage(0);
  };

  return {
    category,
    active,
    technical,
    page,
    dialogState,
    setPage,
    setDialogState,
    setCategory: (value: CriteriaFilterValue) => resetPageAndSet(setCategory, value),
    setActive: (value: BooleanFilterValue) => resetPageAndSet(setActive, value),
    setTechnical: (value: BooleanFilterValue) => resetPageAndSet(setTechnical, value),
    criteria,
    pageData,
    totals,
    criteriaQuery,
    activateMutation,
    deleteMutation,
  };
}
