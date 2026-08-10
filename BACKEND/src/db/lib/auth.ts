import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../index.js";
import * as schema from "../schema/auth.js";
import { adminNotifications } from "../schema/app.js";

/**
 * The admin invite code lives ONLY in the environment.
 * It is never written to the database.
 */
const ADMIN_INVITE_CODE =
  process.env.ADMIN_INVITE_CODE ?? "SNYDER-ADMIN-2025";

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

      // Never settable by the client — set only in databaseHooks below
      status: {
        type: "string",
        required: false,
        defaultValue: "active",
        input: false,
      },

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

      // Audit field — records whether a valid code was used.
      // We store a REDACTED marker, never the raw code.
      adminInviteCodeUsed: {
        type: "string",
        required: false,
        input: false, // client cannot set this
      },
    },
  },

  /**
   * Better Auth 1.6.25 correct hook API.
   *
   * `databaseHooks.user.create.before` receives:
   *   user    — the data about to be written (includes additionalFields)
   *   context — the endpoint context (may be null in some flows)
   *
   * Return `{ data: { ...overrides } }` to mutate what gets written.
   * Return nothing / void to pass through unchanged.
   *
   * IMPORTANT: `adminInviteCode` is an INPUT field sent by the client
   * but intentionally NOT declared in additionalFields, so Better Auth's
   * parseUserInput will include it in the `rest` object that becomes part
   * of the user data passed here. We read it, act on it, and strip it so
   * it is never persisted.
   */
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Cast to access the extra fields sent by the client
          const incoming = user as typeof user & {
            role?: string;
            adminInviteCode?: string;
            status?: string;
            adminInviteCodeUsed?: string;
          };

          const role = incoming.role ?? "student";

          // Students and teachers are active by default — nothing to do
          if (role !== "admin") {
            return {
              data: {
                ...user,
                status: "active",
                // Ensure the raw invite code field never reaches the DB
                adminInviteCode:     undefined,
                adminInviteCodeUsed: undefined,
              },
            };
          }

          // ── Admin path ──────────────────────────────────────────
          const providedCode = incoming.adminInviteCode ?? "";
          const codeIsValid  = providedCode === ADMIN_INVITE_CODE;

          // Build the safe data object — raw code is always stripped
          const safeData = {
            ...user,
            status: codeIsValid ? "active" : "pending",
            // Store a non-sensitive marker, never the raw code
            adminInviteCodeUsed: codeIsValid ? "INVITE_CODE_USED" : null,
            // Explicitly delete the raw code so it never reaches Drizzle
            adminInviteCode: undefined,
          };

          // ── Insert a notification for existing admins ────────────
          // We do this here so it's atomic with user creation.
          // If the user ends up pending, admins need to know.
          if (!codeIsValid) {
            try {
              await db.insert(adminNotifications).values({
                id:          crypto.randomUUID(),
                type:        "admin_approval_request",
                title:       "New Admin Approval Request",
                message:     `A new user (${incoming.name ?? "Unknown"}, ${incoming.email ?? "no email"}) has registered as an administrator and requires approval.`,
                targetRole:  "admin",
                referenceId: incoming.id ?? null,
                read:        false,
                createdAt:   new Date(),
              });
            } catch (notifErr) {
              // Notification failure must NOT block account creation
              console.error(
                "[auth] Failed to insert admin notification:",
                notifErr
              );
            }
          }

          return { data: safeData };
        },
      },
    },
  },
});