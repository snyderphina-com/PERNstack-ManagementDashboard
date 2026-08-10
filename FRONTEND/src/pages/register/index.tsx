import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router";
import { useRegister } from "@refinedev/core";
import { Loader2, Eye, EyeOff } from "lucide-react";

import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { RoleSelector }    from "@/components/auth/RoleSelector";
import { StudentFields }   from "@/components/auth/StudentFields";
import { TeacherFields }   from "@/components/auth/TeacherFields";
import { AdminFields }     from "@/components/auth/AdminFields";
import { ProfileUploader } from "@/components/auth/ProfileUploader";

import type { UserRole, SignUpPayload } from "@/types";

// ── Zod schema ─────────────────────────────────────────────────────
const registerSchema = z
  .object({
    name:            z.string().min(2, "Full name must be at least 2 characters."),
    email:           z.string().email("Please enter a valid email address."),
    password:        z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/,        "Include at least one uppercase letter.")
      .regex(/[0-9]/,        "Include at least one number.")
      .regex(/[^A-Za-z0-9]/, "Include at least one special character."),
    confirmPassword: z.string(),
    role:            z.enum(["student", "teacher", "admin"] as const),

    // Student
    institution: z.string().optional(),
    studentId:   z.string().optional(),

    // Teacher
    subject:           z.string().optional(),
    yearsOfExperience: z.coerce.number().optional(),
    qualification:     z.string().optional(),

    // Admin
    adminInviteCode: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match.",
    path:    ["confirmPassword"],
  })
  .refine(
    (d) =>
      d.role !== "student" ||
      (typeof d.institution === "string" && d.institution.length >= 2),
    { message: "Institution is required for students.", path: ["institution"] }
  )
  .refine(
    (d) =>
      d.role !== "teacher" ||
      (typeof d.subject === "string" && d.subject.length >= 2),
    { message: "Subject specialization is required.", path: ["subject"] }
  )
  .refine(
    (d) =>
      d.role !== "teacher" ||
      (typeof d.yearsOfExperience === "number" && d.yearsOfExperience >= 0),
    { message: "Years of experience is required.", path: ["yearsOfExperience"] }
  )
  .refine(
    (d) =>
      d.role !== "teacher" ||
      (typeof d.qualification === "string" && d.qualification.length >= 2),
    { message: "Qualification is required.", path: ["qualification"] }
  );

export type RegisterFormValues = z.infer<typeof registerSchema>;

const STEPS = ["Credentials", "Role", "Profile"] as const;

export function Register() {
  const [step, setStep]     = useState<0 | 1 | 2>(0);
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<{
    url: string; publicId: string;
  } | null>(null);

  const navigate                           = useNavigate();
  const { mutate: registerMutate, isPending } = useRegister<SignUpPayload>();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver:      zodResolver(registerSchema),
    defaultValues: { role: "student", yearsOfExperience: 0 },
  });

  const selectedRole = watch("role") as UserRole;

  const goNext = async () => {
    const fieldsToValidate =
      step === 0
        ? (["name", "email", "password", "confirmPassword"] as const)
        : (["role"] as const);

    const valid = await trigger(fieldsToValidate);
    if (valid) setStep((s) => (s + 1) as 0 | 1 | 2);
  };

  const goBack = () => setStep((s) => (s - 1) as 0 | 1 | 2);

  const onSubmit = (data: RegisterFormValues) => {
    const payload: SignUpPayload = {
      name:     data.name,
      email:    data.email,
      password: data.password,
      role:     data.role,
      image:    uploadedImage?.url       ?? undefined,
      imageCldPubId: uploadedImage?.publicId ?? undefined,

      ...(data.role === "student" && {
        institution: data.institution,
        studentId:   data.studentId,
      }),
      ...(data.role === "teacher" && {
        subject:           data.subject,
        yearsOfExperience: data.yearsOfExperience,
        qualification:     data.qualification,
      }),
      // IMPORTANT: always pass adminInviteCode for admin role,
      // even if empty — the backend hook decides what to do with it.
      ...(data.role === "admin" && {
        adminInviteCode: data.adminInviteCode ?? "",
      }),
    };

    registerMutate(payload);
    // Navigation is handled by authProvider.register
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 text-center">
          <img
            src="/logo.png"
            alt="SNYDER"
            className="mx-auto h-12 w-12 rounded-xl object-cover shadow-md"
          />
          <h1 className="mt-3 text-2xl font-bold tracking-tight">
            SNYDER<sup className="text-xs font-normal">®</sup>
          </h1>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-4">
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                        i < step
                          ? "bg-primary text-primary-foreground"
                          : i === step
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {i < step ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span className={cn(
                      "text-[10px] font-medium",
                      i === step ? "text-primary" : "text-muted-foreground"
                    )}>
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn(
                      "h-px flex-1 mx-2 mb-4 transition-colors",
                      i < step ? "bg-primary" : "bg-border"
                    )} />
                  )}
                </div>
              ))}
            </div>

            <CardTitle className="text-xl">
              {step === 0 && "Create your account"}
              {step === 1 && "Choose your role"}
              {step === 2 && "Complete your profile"}
            </CardTitle>
            <CardDescription>
              {step === 0 && "Enter your basic information to get started."}
              {step === 1 && "Select the role that best describes how you'll use SNYDER."}
              {step === 2 && "Add a profile photo and role-specific details."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* ── STEP 0: Credentials ── */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Jane Doe"
                      autoComplete="name"
                      {...register("name")}
                      className={cn(errors.name && "border-destructive")}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jane@example.com"
                      autoComplete="email"
                      {...register("email")}
                      className={cn(errors.email && "border-destructive")}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password">
                      Password <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPw ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        {...register("password")}
                        className={cn("pr-10", errors.password && "border-destructive")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                        aria-label={showPw ? "Hide password" : "Show password"}
                      >
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-destructive">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">
                      Confirm Password <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showCpw ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        {...register("confirmPassword")}
                        className={cn("pr-10", errors.confirmPassword && "border-destructive")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCpw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                        aria-label={showCpw ? "Hide password" : "Show password"}
                      >
                        {showCpw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* ── STEP 1: Role ── */}
              {step === 1 && (
                <RoleSelector
                  value={selectedRole}
                  onChange={(r) => setValue("role", r)}
                />
              )}

              {/* ── STEP 2: Profile ── */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-medium mb-3">Profile Picture</p>
                    <ProfileUploader
                      value={uploadedImage?.url}
                      onChange={setUploadedImage}
                      disabled={isPending}
                    />
                  </div>

                  <div className="border-t pt-4">
                    {selectedRole === "student" && (
                      <StudentFields register={register} errors={errors} disabled={isPending} />
                    )}
                    {selectedRole === "teacher" && (
                      <TeacherFields register={register} errors={errors} disabled={isPending} />
                    )}
                    {selectedRole === "admin" && (
                      <AdminFields register={register} errors={errors} disabled={isPending} />
                    )}
                  </div>
                </div>
              )}

              {/* ── Navigation ── */}
              <div className={cn("flex mt-6 gap-3", step > 0 ? "justify-between" : "justify-end")}>
                {step > 0 && (
                  <Button type="button" variant="outline" onClick={goBack} disabled={isPending}>
                    Back
                  </Button>
                )}
                {step < 2 ? (
                  <Button type="button" onClick={goNext}>Continue</Button>
                ) : (
                  <Button type="submit" disabled={isPending} className="min-w-32">
                    {isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account…</>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                )}
              </div>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}