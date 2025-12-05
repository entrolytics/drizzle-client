/**
 * Query utility types for consistent pagination and filtering patterns across Entrolytics consumers
 */

/**
 * Pagination and sort parameters
 */
export interface PageParams {
  page?: number;
  pageSize?: number;
}

export interface SortParams {
  orderBy?: string;
  sortDescending?: boolean;
}

/**
 * Date range parameters
 */
export interface DateParams {
  startDate?: Date;
  endDate?: Date;
  unit?: string;
  timezone?: string;
  compareDate?: Date;
}

/**
 * Filter parameters for analytics queries
 */
export interface FilterParams {
  path?: string;
  referrer?: string;
  title?: string;
  query?: string;
  host?: string;
  os?: string;
  browser?: string;
  device?: string;
  country?: string;
  region?: string;
  city?: string;
  language?: string;
  event?: string;
  search?: string;
  tag?: string;
  eventType?: number;
  segment?: string;
  cohort?: string;
  compare?: string;
  value?: string;
  currency?: string;
}

/**
 * Segment parameters
 */
export interface SegmentParams {
  segmentId?: string;
}

/**
 * Combined query filters interface
 */
export interface QueryFilters
  extends DateParams,
    FilterParams,
    SortParams,
    PageParams,
    SegmentParams {
  cohortFilters?: QueryFilters;
}

/**
 * Paginated result wrapper
 */
export interface PageResult<T> {
  data: T;
  count: number;
  page: number;
  pageSize: number;
  orderBy?: string;
  sortDescending?: boolean;
  search?: string;
}

/**
 * Query options for advanced queries
 */
export interface QueryOptions {
  joinSession?: boolean;
  columns?: Record<string, string>;
  limit?: number;
  prefix?: string;
  isCohort?: boolean;
}
