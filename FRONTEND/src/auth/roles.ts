import type { Role } from "@/types";

/** Dashboard route each role lands on after login / signup */
export const ROLE_DASHBOARD: Record<Role, string> = {
  student: "/student/dashboard",
  teacher: "/teacher/dashboard",
  admin:   "/admin/dashboard",
};

/** Human-readable labels */
export const ROLE_LABELS: Record<Role, string> = {
  student: "Student",
  teacher: "Teacher",
  admin:   "Administrator",
};

export const ALL_ROLES: Role[] = ["student", "teacher", "admin"];