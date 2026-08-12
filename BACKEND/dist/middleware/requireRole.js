import { auth } from "../db/lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
/**
 * Middleware factory — protects routes by role.
 *
 * Usage:
 *   router.get("/admin-only", requireRole(["admin"]), handler)
 *   router.get("/staff",      requireRole(["teacher", "admin"]), handler)
 */
export function requireRole(allowedRoles) {
    return async (req, res, next) => {
        try {
            const session = await auth.api.getSession({
                headers: fromNodeHeaders(req.headers),
            });
            if (!session?.user) {
                res.status(401).json({
                    error: "Unauthorized",
                    message: "You must be logged in to access this resource.",
                });
                return;
            }
            const userRole = session.user.role;
            const userStatus = session.user.status;
            if (!userRole || !allowedRoles.includes(userRole)) {
                res.status(403).json({
                    error: "Forbidden",
                    message: `This resource requires one of the following roles: ${allowedRoles.join(", ")}.`,
                });
                return;
            }
            // Block pending admin accounts from accessing protected resources
            if (userStatus === "pending") {
                res.status(403).json({
                    error: "Account Pending",
                    message: "Your admin account is awaiting approval. Please contact a system administrator.",
                });
                return;
            }
            // Attach session to request for downstream handlers
            req.session = session;
            next();
        }
        catch (err) {
            console.error("requireRole error:", err);
            res.status(500).json({
                error: "Internal Server Error",
                message: "Authentication check failed.",
            });
        }
    };
}
//# sourceMappingURL=requireRole.js.map