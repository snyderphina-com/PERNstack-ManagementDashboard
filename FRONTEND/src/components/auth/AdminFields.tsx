import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { RegisterFormValues } from "@/pages/register";
import { Label }  from "@/components/ui/label";
import { Input }  from "@/components/ui/input";
import { cn }     from "@/lib/utils";
import { Info }   from "lucide-react";
import { ShieldAlert } from "lucide-react";

interface AdminFieldsProps {
  register: UseFormRegister<RegisterFormValues>;
  errors:   FieldErrors<RegisterFormValues>;
  disabled?: boolean;
}

export function AdminFields({ register, errors, disabled }: AdminFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-xs text-amber-700 dark:text-amber-300 leading-snug">
          Admin accounts require an invite code. Without a valid code your
          account will be created with <strong>pending</strong> status and must
          be approved by an existing administrator.
        </p>   <p className="text-xs text-amber-700/80 dark:text-amber-300/80 leading-snug">
            Admin accounts can only be created with a valid invitation code
            issued by an existing administrator. The code is single-use and
            expires after 7 days.
          </p>
      </div>

      {/* Invite code */}
      <div className="space-y-1.5">
        <Label htmlFor="adminInviteCode">Admin Invite Code (optional)</Label>
        <Input
          id="adminInviteCode"
          placeholder="SNYDER-ADMIN-XXXX"
          disabled={disabled}
          {...register("adminInviteCode")}
          className={cn(
            "font-mono uppercase tracking-widest",
            errors.adminInviteCode && "border-destructive"
          )}
          autoComplete="off"
          spellCheck={false}
        />
        {errors.adminInviteCode && (
          <p className="text-xs text-destructive">
            {errors.adminInviteCode.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Leave blank to create a pending account awaiting approval.
        </p>
      </div>
    </div>
  );
}