import type { ReactNode } from "react";
import { useGetIdentity } from "@refinedev/core";
import type { Role, User } from "@/types";
import { ShieldX } from "lucide-react";

interface RoleGuardProps {
  allowedRoles: Role[];
  children: ReactNode;
  /** Optional custom fallback — defaults to an "Access Denied" card */
  fallback?: ReactNode;
}

export function RoleGuard({
  allowedRoles,
  children,
  fallback,
}: RoleGuardProps) {
  const { data: identity } = useGetIdentity<User>();

  if (!identity) return null;

  if (!allowedRoles.includes(identity.role)) {
    return (
      fallback ?? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center p-8">
          <div className="rounded-full bg-destructive/10 p-4">
            <ShieldX className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground max-w-sm">
            Your current role ({identity.role}) does not have permission to
            view this page.
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
}