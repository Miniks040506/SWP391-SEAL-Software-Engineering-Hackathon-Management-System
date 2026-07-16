export type UUID = string;
export type ISODateTime = string;

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type MessageResponse = {
  message: string;
};

export type FieldErrorResponse = {
  field: string;
  message: string;
};

export type ApiErrorResponse = {
  success: boolean;
  status: number;
  error: string;
  code?: string | null;
  message: string;
  path: string;
  timestamp: ISODateTime;
  fieldErrors?: FieldErrorResponse[];
};

export type PageParams = {
  page?: number;
  size?: number;
};

export type SortParams = {
  sort?: string;
};

export type DateRangeParams = {
  from?: string;
  to?: string;
};
