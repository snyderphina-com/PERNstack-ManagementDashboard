CREATE TABLE "admin_invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"code_hash" text NOT NULL,
	"created_by" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"used_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "admin_invitations_code_hash_unique" ON "admin_invitations" USING btree ("code_hash");--> statement-breakpoint
CREATE INDEX "admin_invitations_created_by_idx" ON "admin_invitations" USING btree ("created_by");