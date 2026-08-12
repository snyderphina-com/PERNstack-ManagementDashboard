import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { adminNotifications } from "../db/schema/app.js";
import { requireRole } from "../middleware/requireRole.js";
const router = Router();
/**
 * GET /api/notifications
 * Returns unread notifications for the calling admin.
 * Protected — admin only.
 */
router.get("/", requireRole(["admin"]), async (_req, res) => {
    try {
        const rows = await db
            .select()
            .from(adminNotifications)
            .where(eq(adminNotifications.targetRole, "admin"))
            .orderBy(desc(adminNotifications.createdAt))
            .limit(50);
        res.json({ data: rows });
    }
    catch (err) {
        console.error("GET /notifications error:", err);
        res.status(500).json({ error: "Failed to fetch notifications." });
    }
});
/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read.
 * Protected — admin only.
 */
router.patch("/:id/read", requireRole(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || Array.isArray(id)) {
            return res.status(400).json({
                message: "Invalid notification ID",
            });
        }
        const [updated] = await db
            .update(adminNotifications)
            .set({ read: true })
            .where(eq(adminNotifications.id, id))
            .returning();
        if (!updated) {
            res.status(404).json({ error: "Notification not found." });
            return;
        }
        res.json({ data: updated });
    }
    catch (err) {
        console.error("PATCH /notifications/:id/read error:", err);
        res.status(500).json({ error: "Failed to mark notification as read." });
    }
});
/**
 * PATCH /api/notifications/read-all
 * Mark all admin notifications as read.
 * Protected — admin only.
 */
router.patch("/read-all", requireRole(["admin"]), async (_req, res) => {
    try {
        await db
            .update(adminNotifications)
            .set({ read: true })
            .where(eq(adminNotifications.targetRole, "admin"));
        res.json({ success: true });
    }
    catch (err) {
        console.error("PATCH /notifications/read-all error:", err);
        res.status(500).json({ error: "Failed to mark all as read." });
    }
});
export default router;
//# sourceMappingURL=notifications.js.map