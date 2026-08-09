import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { RegisterFormValues } from "@/pages/register";
import { Label }    from "@/components/ui/label";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn }       from "@/lib/utils";

interface TeacherFieldsProps {
  register: UseFormRegister<RegisterFormValues>;
  errors:   FieldErrors<RegisterFormValues>;
  disabled?: boolean;
}

export function TeacherFields({ register, errors, disabled }: TeacherFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Subject */}
      <div className="space-y-1.5">
        <Label htmlFor="subject">
          Subject Specialization <span className="text-destructive">*</span>
        </Label>
        <Input
          id="subject"
          placeholder="e.g. Mathematics, Computer Science"
          disabled={disabled}
          {...register("subject")}
          className={cn(errors.subject && "border-destructive")}
        />
        {errors.subject && (
          <p className="text-xs text-destructive">{errors.subject.message}</p>
        )}
      </div>

      {/* Years of experience */}
      <div className="space-y-1.5">
        <Label htmlFor="yearsOfExperience">
          Years of Experience <span className="text-destructive">*</span>
        </Label>
        <Input
          id="yearsOfExperience"
          type="number"
          min={0}
          max={60}
          placeholder="5"
          disabled={disabled}
          {...register("yearsOfExperience", { valueAsNumber: true })}
          className={cn(errors.yearsOfExperience && "border-destructive")}
        />
        {errors.yearsOfExperience && (
          <p className="text-xs text-destructive">
            {errors.yearsOfExperience.message}
          </p>
        )}
      </div>

      {/* Qualification */}
      <div className="space-y-1.5">
        <Label htmlFor="qualification">
          Highest Qualification <span className="text-destructive">*</span>
        </Label>
        <Input
          id="qualification"
          placeholder="e.g. M.Sc. Computer Science, PhD"
          disabled={disabled}
          {...register("qualification")}
          className={cn(errors.qualification && "border-destructive")}
        />
        {errors.qualification && (
          <p className="text-xs text-destructive">
            {errors.qualification.message}
          </p>
        )}
      </div>
    </div>
  );
}