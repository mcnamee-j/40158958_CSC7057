//File added during refactoring in Sprint 5,
//Extracted repeatedly used constants into their own file
//Enhances code maintainability and reduces risk of bugs if these roles
// were ever changed

//query routes - excludes admin — admins manage orgs/staff/system config, not day-to-day
// patient queries, which are handled by pharmacy/practice staff and managers
export const ALLOWED_QUERY_ROLES = [
  "pharmacy_staff",
  "pharmacy_manager",
  "practice_staff",
  "practice_manager",
];

//report routes - admin included — can view stats for any org via the organisation_id param
export const MANAGER_ROLES_NO_ADMIN = ["pharmacy_manager", "practice_manager"];

//staff routes - admin required for create/deactivate/reactivate/reset-password actions
export const MANAGER_ROLES = ["pharmacy_manager", "practice_manager", "admin"];

//staff routes - read-only access (populates filter dropdowns for all org roles)
export const STAFF_ROLES = [
  "pharmacy_staff",
  "pharmacy_manager",
  "practice_staff",
  "practice_manager",
  "admin",
];
