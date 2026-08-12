import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../index.js";
import * as schema from "../schema/auth.js";
import { adminInvitations } from "../schema/app.js";
import { hashInvitationCode, normaliseCode, } from "../../services/invitationCode.js";
export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [process.env.FRONTEND_URL],
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
            status: {
                type: "string",
                required: false,
                defaultValue: "active",
                input: false, // client cannot set this
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
            // Stores the invitation ID used (not the code, not the hash)
            adminInviteCodeUsed: {
                type: "string",
                required: false,
                input: false,
            },
        },
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    const incoming = user;
                    const role = incoming.role ?? "student";
                    // ── Students and teachers: active, no invite needed ──────
                    if (role !== "admin") {
                        return {
                            data: {
                                ...user,
                                status: "active",
                                adminInviteCode: undefined,
                                adminInviteCodeUsed: undefined,
                            },
                        };
                    }
                    // ── Admin path: invitation code is REQUIRED ───────────────
                    const rawCode = incoming.adminInviteCode ?? "";
                    if (!rawCode) {
                        throw new Error("Admin invitation code is required.");
                    }
                    const codeHash = hashInvitationCode(normaliseCode(rawCode));
                    const now = new Date();
                    // Look up invitation by hash
                    const [invitation] = await db
                        .select()
                        .from(adminInvitations)
                        .where(eq(adminInvitations.codeHash, codeHash))
                        .limit(1);
                    if (!invitation) {
                        throw new Error("Invalid admin invitation code.");
                    }
                    if (invitation.expiresAt <= now) {
                        throw new Error("This admin invitation code has expired.");
                    }
                    if (invitation.usedAt !== null) {
                        throw new Error("This admin invitation code has already been used.");
                    }
                    // ── Mark invitation as used atomically ───────────────────
                    // We update here (before user row exists) so the invitation
                    // is consumed even if subsequent steps fail — preventing races.
                    // usedBy will be filled in the `after` hook once we have the id.
                    const [updated] = await db
                        .update(adminInvitations)
                        .set({ usedAt: now })
                        .where(and(eq(adminInvitations.id, invitation.id), isNull(adminInvitations.usedAt) // guard against race
                    ))
                        .returning({ id: adminInvitations.id });
                    if (!updated) {
                        // Another request consumed this code between our SELECT and UPDATE
                        throw new Error("This admin invitation code has already been used.");
                    }
                    // Build the clean user record: raw code never reaches Drizzle
                    return {
                        data: {
                            ...user,
                            status: "active",
                            adminInviteCodeUsed: invitation.id, // store the invitation ID, not the code
                            adminInviteCode: undefined,
                        },
                    };
                },
                after: async (user) => {
                    // If this is an admin, backfill usedBy now that we have the user id.
                    // adminInviteCodeUsed holds the invitation id at this point.
                    const u = user;
                    if (u.role === "admin" && u.adminInviteCodeUsed) {
                        await db
                            .update(adminInvitations)
                            .set({ usedBy: user.id })
                            .where(eq(adminInvitations.id, u.adminInviteCodeUsed))
                            .catch((err) => {
                            // Non-fatal — user is already created and active
                            console.error("[auth] Failed to backfill usedBy:", err);
                        });
                    }
                },
            },
        },
    },
});
//# sourceMappingURL=auth.js.map