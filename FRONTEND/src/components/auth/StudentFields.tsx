import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { RegisterFormValues } from "@/pages/register";
import { Label }  from "@/components/ui/label";
import { Input }  from "@/components/ui/input";
import { cn }     from "@/lib/utils";

interface StudentFieldsProps {
  register: UseFormRegister<RegisterFormValues>;
  errors:   FieldErrors<RegisterFormValues>;
  disabled?: boolean;
}

export function StudentFields({ register, errors, disabled }: StudentFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Institution */}
      <div className="space-y-1.5">
        <Label htmlFor="institution">
          Institution <span className="text-destructive">*</span>
        </Label>
        <Input
          id="institution"
          placeholder="University of Nairobi"
          disabled={disabled}
          {...register("institution")}
          className={cn(errors.institution && "border-destructive")}
        />
        {errors.institution && (
          <p className="text-xs text-destructive">{errors.institution.message}</p>
        )}
      </div>

      {/* Student ID */}
      <div className="space-y-1.5">
        <Label htmlFor="studentId">Student ID (optional)</Label>
        <Input
          id="studentId"
          placeholder="STU-2025-001"
          disabled={disabled}
          {...register("studentId")}
        />
      </div>
    </div>
  );
}