import type { UserRole } from "@/types";

/* Dashboard route each role lands on after login / signup */
export const ROLE_DASHBOARD: Record<UserRole, string> = {
  student: "/student/dashboard",
  teacher: "/teacher/dashboard",
  admin:   "/admin/dashboard",
};


export const ROLE_LABELS: Record<UserRole, string> = {
  student: "Student",
  teacher: "Teacher",
  admin:   "Administrator",
};

export const ALL_ROLES: UserRole[] = ["student", "teacher", "admin"];