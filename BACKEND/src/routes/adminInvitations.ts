import { Router, type Request, type Response } from "express";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db }                from "../db/index.js";
import { adminInvitations }  from "../db/schema/app.js";
import { user as userTable } from "../db/schema/auth.js";
import { requireRole }       from "../middleware/requireRole.js";
import {
  generateInvitationCode,
  hashInvitationCode,
} from "../services/invitationCode.js";

const router = Router();

/** Expiry duration in milliseconds — default 7 days, env-configurable */
function getExpiryMs(): number {
  const days = parseInt(process.env.ADMIN_INVITE_EXPIRY_DAYS ?? "7", 10);
  return (isNaN(days) || days < 1 ? 7 : days) * 24 * 60 * 60 * 1000;
}

// ── POST /api/admin/invitations ────────────────────────────────────
// Create a new invitation. Admin only.
router.post(
  "/",
  requireRole(["admin"]),
  async (req: Request, res: Response) => {
    try {
      // requireRole attaches the session
      const session = (req as Request & {
         session: { user: { id: string } } })
        .session;

console.log("INVITATION ROUTE - req.session:", session);

if (!session?.user?.id) {
  return res.status(401).json({
    error: "Session missing from request",
  });
}

      const adminId = session.user.id;

      const plaintext = generateInvitationCode();
      const codeHash  = hashInvitationCode(plaintext);
      const expiresAt = new Date(Date.now() + getExpiryMs());
      const id        = crypto.randomUUID();

      await db.insert(adminInvitations).values({
        id,
        codeHash,
        createdBy: adminId,
        expiresAt,
        usedAt:    null,
        usedBy:    null,
        createdAt: new Date(),
      });

      // Return plaintext ONCE. Never log it in production.
      res.status(201).json({
        success:   true,
        code:      plaintext,
        expiresAt: expiresAt.toISOString(),
      });
    } catch (err) {
      console.error("POST /admin/invitations error:", err);
      res.status(500).json({ error: "Failed to generate invitation." });
    }
  }
);

// ── GET /api/admin/invitations ─────────────────────────────────────
// List all invitations. Admin only.
// Never returns the plaintext code or the hash.
router.get(
  "/",
  requireRole(["admin"]),
  async (_req: Request, res: Response) => {
    try {
      const rows = await db
        .select({
          id:        adminInvitations.id,
          createdBy: adminInvitations.createdBy,
          expiresAt: adminInvitations.expiresAt,
          usedAt:    adminInvitations.usedAt,
          usedBy:    adminInvitations.usedBy,
          createdAt: adminInvitations.createdAt,
          // Derive status — never expose codeHash
          createdByName: userTable.name,
          usedByEmail:   userTable.email,
        })
        .from(adminInvitations)
        .leftJoin(userTable, eq(adminInvitations.createdBy, userTable.id))
        .orderBy(desc(adminInvitations.createdAt))
        .limit(100);

      res.json({ data: rows });
    } catch (err) {
      console.error("GET /admin/invitations error:", err);
      res.status(500).json({ error: "Failed to fetch invitations." });
    }
  }
);

// ── DELETE /api/admin/invitations/:id ─────────────────────────────
// Revoke an unused invitation. Admin only.
router.delete(
  "/:id",
  requireRole(["admin"]),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
  return res.status(400).json({
    message: "Invalid invitation ID",
  });
}

      // Only allow deletion of unused invitations
      const [existing] = await db
        .select({ id: adminInvitations.id, usedAt: adminInvitations.usedAt })
        .from(adminInvitations)
        .where(eq(adminInvitations.id, id))
        .limit(1);

      if (!existing) {
        res.status(404).json({ error: "Invitation not found." });
        return;
      }

      if (existing.usedAt !== null) {
        res.status(409).json({ error: "Cannot revoke an already-used invitation." });
        return;
      }

      await db
        .delete(adminInvitations)
        .where(eq(adminInvitations.id, id));

      res.json({ success: true });
    } catch (err) {
      console.error("DELETE /admin/invitations/:id error:", err);
      res.status(500).json({ error: "Failed to revoke invitation." });
    }
  }
);

export default router;