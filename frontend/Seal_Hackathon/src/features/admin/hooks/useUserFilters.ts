import { useState } from "react";
import type { UserRole } from "@/types/auth.types";
import type { UserStatus } from "@/types/user.types";

export type UserFilters = {
  search: string;
  role: UserRole | "";
  status: UserStatus | "";
  page: number;
};

type UseUserFiltersReturn = UserFilters & {
  setSearch: (value: string) => void;
  setRole: (value: UserRole | "") => void;
  setStatus: (value: UserStatus | "") => void;
  setPage: (page: number) => void;
};

/**
 * Quản lý state filter/search/pagination cho trang Users.
 * Mỗi khi thay đổi filter (search/role/status), tự reset page về 1.
 */
export function useUserFilters(): UseUserFiltersReturn {
  const [search, setSearchRaw] = useState("");
  const [role, setRoleRaw] = useState<UserRole | "">("");
  const [status, setStatusRaw] = useState<UserStatus | "">("");
  const [page, setPage] = useState(1);

  const resetPage = () => setPage(1);

  return {
    search,
    role,
    status,
    page,
    setSearch: (value) => { setSearchRaw(value); resetPage(); },
    setRole: (value) => { setRoleRaw(value); resetPage(); },
    setStatus: (value) => { setStatusRaw(value); resetPage(); },
    setPage,
  };
}