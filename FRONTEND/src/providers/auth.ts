import type { AuthProvider } from "@refinedev/core";
import type { User, SignUpPayload } from "@/types";
import { authClient } from "@/lib/auth-client";
import { ROLE_DASHBOARD } from "@/auth/roles";

export const authProvider: AuthProvider = {
  register: async (params: SignUpPayload) => {
    try {
      const { data, error } = await authClient.signUp.email(
        params as Parameters<typeof authClient.signUp.email>[0]
      );

      if (error) {
        return {
          success: false,
          error: {
            name:    "Registration failed",
            message: error.message ?? "Unable to create account.",
          },
        };
      }

      if (!data?.user) {
        return {
          success: false,
          error: {
            name:    "Registration failed",
            message: "No user data returned from server.",
          },
        };
      }

      // Better Auth returns additionalFields on the user object
      const user = data.user as User & Record<string, unknown>;

      localStorage.setItem("user", JSON.stringify(user));

      // Admin accounts that lacked a valid invite code are "pending"
      if (user.role === "admin" && (user.status as string) === "pending") {
        return { success: true, redirectTo: "/pending-approval" };
      }

      return {
        success:    true,
        redirectTo: ROLE_DASHBOARD[user.role] ?? "/",
      };
    } catch (err) {
      console.error("Register error:", err);
      return {
        success: false,
        error: {
          name:    "Registration failed",
          message: "Unable to create account. Please try again.",
        },
      };
    }
  },

  login: async ({ email, password, providerName }) => {
    if (providerName) {
      return {
        success: false,
        error: {
          name:    "Provider login not configured",
          message: "Google/GitHub login is not configured yet.",
        },
      };
    }

    if (!email || !password) {
      return {
        success: false,
        error: { name: "Missing credentials", message: "Email and password are required." },
      };
    }

    try {
      const { data, error } = await authClient.signIn.email({ email, password });

      if (error) {
        return {
          success: false,
          error: { name: "Login failed", message: error.message ?? "Please try again." },
        };
      }

      if (!data?.user) {
        return {
          success: false,
          error: { name: "Login failed", message: "No user data returned." },
        };
      }

      const user = data.user as User & Record<string, unknown>;
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin" && (user.status as string) === "pending") {
        return { success: true, redirectTo: "/pending-approval" };
      }

      return {
        success:    true,
        redirectTo: ROLE_DASHBOARD[user.role] ?? "/",
      };
    } catch (err) {
      console.error("Login exception:", err);
      return {
        success: false,
        error: { name: "Login failed", message: "Please try again later." },
      };
    }
  },

  logout: async () => {
    await authClient.signOut().catch(console.error);
    localStorage.removeItem("user");
    return { success: true, redirectTo: "/login" };
  },

  onError: async (error) => {
    if (error.response?.status === 401) return { logout: true };
    return { error };
  },

  check: async () => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      return {
        authenticated: false,
        logout:        true,
        redirectTo:    "/login",
        error: { name: "Unauthorized", message: "Not logged in." },
      };
    }
    return { authenticated: true };
  },

  getPermissions: async () => {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const u: User = JSON.parse(raw);
    return { role: u.role, status: u.status };
  },

  getIdentity: async () => {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const u: User = JSON.parse(raw);
    return {
      id:                u.id,
      name:              u.name,
      email:             u.email,
      image:             u.image,
      role:              u.role,
      status:            u.status,
      imageCldPubId:     u.imageCldPubId,
      institution:       u.institution,
      studentId:         u.studentId,
      subject:           u.subject,
      yearsOfExperience: u.yearsOfExperience,
      qualification:     u.qualification,
    };
  },
};