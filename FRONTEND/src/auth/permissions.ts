import type { UserRole } from "@/types";

export type PermissionKey =
  // Student
  | "courses:view"
  | "assignments:submit"
  | "grades:view"
  // Teacher
  | "courses:create"
  | "courses:manage"
  | "students:manage"
  | "assignments:grade"
  // Admin
  | "users:manage"
  | "teachers:approve"
  | "system:settings"
  | "departments:manage"
  | "subjects:manage";

const ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  student: [
    "courses:view",
    "assignments:submit",
    "grades:view",
  ],
  teacher: [
    "courses:view",
    "courses:create",
    "courses:manage",
    "students:manage",
    "assignments:grade",
    "grades:view",
  ],
  admin: [
    "courses:view",
    "courses:create",
    "courses:manage",
    "students:manage",
    "assignments:grade",
    "assignments:submit",
    "grades:view",
    "users:manage",
    "teachers:approve",
    "system:settings",
    "departments:manage",
    "subjects:manage",
  ],
};

export function hasPermission(
  role: UserRole | undefined | null,
  permission: PermissionKey
): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getPermissions(role: UserRole): PermissionKey[] {
  return ROLE_PERMISSIONS[role] ?? [];
}