/**
 * Public API for the shared ResourceList system.
 *
 * Import from this barrel file to keep consumer imports stable even if the
 * internal file structure changes:
 *
 *   import { ResourceList } from "@/components/shared/resource-list";
 *   import { useResourceList } from "@/components/shared/resource-list";
 *   import { ResourceListFilters } from "@/components/shared/resource-list";
 *   import type { FilterConfig, ResourceListProps, FetchFn } from "@/components/shared/resource-list";
 */

// Main component
export { ResourceList } from "./resource-list";

// Filter bar — exposed for advanced use-cases where the caller wants to
// position the filter bar separately from the list body.
export { ResourceListFilters } from "./resource-list-filters";

// Custom hook — exposed so existing concrete wrappers can migrate
// incrementally by adopting the hook directly before switching to the full
// generic component.
export { useResourceList } from "./use-resource-list";

// Types — re-exported as named type exports so consumers that want strict
// import separation can import types without pulling in runtime code.
export type {
  FilterConfig,
  FilterOption,
  BaseFilterParams,
  BackendEnvelope,
  FetchFn,
  ResourceListProps,
  UseResourceListReturn,
} from "./types";
