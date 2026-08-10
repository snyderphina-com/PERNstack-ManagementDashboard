CREATE TYPE "public"."status" AS ENUM('active', 'pending', 'suspended');--> statement-breakpoint
CREATE TABLE "admin_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"target_role" text NOT NULL,
	"reference_id" text,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "status" "status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "institution" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "student_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "subject" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "years_of_experience" integer;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "qualification" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "admin_invite_code_used" text;