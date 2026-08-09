import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../index.js";
import * as schema from "../schema/auth.js";

const ADMIN_INVITE_CODE = process.env.ADMIN_INVITE_CODE ?? "SNYDER-ADMIN-2025";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,

  trustedOrigins: [process.env.FRONTEND_URL!],

  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },

  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "student",
        input: true,
      },

      imageCldPubId: {
        type: "string",
        required: false,
        input: true,
      },

      // Account status — admin accounts start as "pending"
      status: {
        type: "string",
        required: false,
        defaultValue: "active",
        input: false, // never set by client directly
      },

      // Student fields
      institution: {
        type: "string",
        required: false,
        input: true,
      },
      studentId: {
        type: "string",
        required: false,
        input: true,
      },

      // Teacher fields
      subject: {
        type: "string",
        required: false,
        input: true,
      },
      yearsOfExperience: {
        type: "number",
        required: false,
        input: true,
      },
      qualification: {
        type: "string",
        required: false,
        input: true,
      },

      // Admin audit field — not exposed to client
      adminInviteCodeUsed: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },

  hooks: {
    before: [
      {
        // Intercept signup to:
        // 1. Validate admin invite code
        // 2. Set admin accounts to "pending" if no valid code
        matcher: (context) => context.path === "/sign-up/email",
        handler: async (context) => {
          const body = context.body as Record<string, unknown>;
          const role = (body.role as string) ?? "student";

          if (role === "admin") {
            const providedCode = (body.adminInviteCode as string) ?? "";

            if (providedCode === ADMIN_INVITE_CODE) {
              // Valid code — set status active and record the code used
              body.status = "active";
              body.adminInviteCodeUsed = providedCode;
            } else {
              // No valid code — create as pending for manual approval
              body.status = "pending";
            }

            // Never let the raw invite code field leak into stored user
            delete body.adminInviteCode;
          }

          return { context };
        },
      },
    ],
  },
});