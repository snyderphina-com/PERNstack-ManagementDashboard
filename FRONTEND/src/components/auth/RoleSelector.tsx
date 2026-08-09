import { GraduationCap, BookOpen, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

interface RoleOption {
  value:       UserRole;
  label:       string;
  description: string;
  icon:        React.ElementType;
  color:       string;
  ring:        string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    value:       "student",
    label:       "Student",
    description: "Enroll in classes and track your academic progress.",
    icon:        GraduationCap,
    color:       "text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400",
    ring:        "ring-blue-500",
  },
  {
    value:       "teacher",
    label:       "Teacher",
    description: "Create and manage classes, grade assignments.",
    icon:        BookOpen,
    color:       "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400",
    ring:        "ring-emerald-500",
  },
  {
    value:       "admin",
    label:       "Administrator",
    description: "Full system access. Requires an invite code or approval.",
    icon:        ShieldCheck,
    color:       "text-violet-600 bg-violet-50 dark:bg-violet-950/50 dark:text-violet-400",
    ring:        "ring-violet-500",
  },
];

interface RoleSelectorProps {
  value:    UserRole | null;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
}

export function RoleSelector({ value, onChange, disabled }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {ROLE_OPTIONS.map((opt) => {
        const Icon      = opt.icon;
        const isSelected = value === opt.value;

        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center",
              "transition-all duration-200 cursor-pointer",
              "hover:border-primary/60 hover:bg-accent/50",
              "disabled:cursor-not-allowed disabled:opacity-50",
              isSelected
                ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                : "border-border bg-card"
            )}
            aria-pressed={isSelected}
          >
            {/* Icon bubble */}
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                opt.color
              )}
            >
              <Icon className="h-6 w-6" />
            </div>

            {/* Label */}
            <span
              className={cn(
                "text-sm font-semibold",
                isSelected ? "text-primary" : "text-foreground"
              )}
            >
              {opt.label}
            </span>

            {/* Description */}
            <span className="text-xs text-muted-foreground leading-snug">
              {opt.description}
            </span>

            {/* Selected check */}
            {isSelected && (
              <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                <svg
                  className="h-3 w-3 text-primary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}