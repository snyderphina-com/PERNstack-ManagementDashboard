import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../index.js";
import * as schema from "../schema/auth.js";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,

  trustedOrigins: [
    process.env.FRONTEND_URL!,
  ],

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
    },
  },
});