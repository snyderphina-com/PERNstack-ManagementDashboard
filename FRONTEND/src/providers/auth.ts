import type { AuthProvider } from "@refinedev/core";
import { User, SignUpPayload } from "@/types";
import { authClient } from "@/lib/auth-client";
import { ROLE_DASHBOARD } from "@/auth/roles";

export const authProvider: AuthProvider = {
  register: async ({
    email,
    password,
    name,
    role,
    image,
    imageCldPubId,
    // Student
    institution,
    studentId,
    // Teacher
    subject,
    yearsOfExperience,
    qualification,
    // Admin
    adminInviteCode,
  }: SignUpPayload) => {
    try {
      const { data, error } = await authClient.signUp.email({
        name,
        email,
        password,
        image,
        role,
        imageCldPubId,
        // Better Auth passes additionalFields through
        institution,
        studentId,
        subject,
        yearsOfExperience,
        qualification,
        adminInviteCode,
      } as any);

      if (error) {
        return {
          success: false,
          error: {
            name:    "Registration failed",
            message: error?.message || "Unable to create account. Please try again.",
          },
        };
      }

      const user = data.user as User;

      // Check if admin is pending
      if (user.role === "admin" && user.status === "pending") {
        localStorage.setItem("user", JSON.stringify(user));
        return {
          success:    true,
          redirectTo: "/pending-approval",
        };
      }

      localStorage.setItem("user", JSON.stringify(user));

      return {
        success:    true,
        redirectTo: ROLE_DASHBOARD[user.role] ?? "/",
      };
    } catch (error) {
      console.error("Register error:", error);
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
        error: {
          name:    "Missing credentials",
          message: "Email and password are required.",
        },
      };
    }

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: {
            name:    "Login failed",
            message: error?.message || "Please try again later.",
          },
        };
      }

      const user = data.user as User;

      if (user.role === "admin" && user.status === "pending") {
        localStorage.setItem("user", JSON.stringify(user));
        return {
          success:    true,
          redirectTo: "/pending-approval",
        };
      }

      localStorage.setItem("user", JSON.stringify(user));

      return {
        success:    true,
        redirectTo: ROLE_DASHBOARD[user.role] ?? "/",
      };
    } catch (error) {
      console.error("Login exception:", error);
      return {
        success: false,
        error: {
          name:    "Login failed",
          message: "Please try again later.",
        },
      };
    }
  },

  logout: async () => {
    const { error } = await authClient.signOut();
    if (error) console.error("Logout error:", error);
    localStorage.removeItem("user");
    return { success: true, redirectTo: "/login" };
  },

  onError: async (error) => {
    if (error.response?.status === 401) return { logout: true };
    return { error };
  },

  check: async () => {
    const user = localStorage.getItem("user");
    if (user) return { authenticated: true };
    return {
      authenticated: false,
      logout:        true,
      redirectTo:    "/login",
      error: {
        name:    "Unauthorized",
        message: "Check failed",
      },
    };
  },

  getPermissions: async () => {
    const user = localStorage.getItem("user");
    if (!user) return null;
    const parsed: User = JSON.parse(user);
    return { role: parsed.role, status: parsed.status };
  },

  getIdentity: async () => {
    const user = localStorage.getItem("user");
    if (!user) return null;
    const parsed: User = JSON.parse(user);
    return {
      id:                parsed.id,
      name:              parsed.name,
      email:             parsed.email,
      image:             parsed.image,
      role:              parsed.role,
      status:            parsed.status,
      imageCldPubId:     parsed.imageCldPubId,
      institution:       parsed.institution,
      studentId:         parsed.studentId,
      subject:           parsed.subject,
      yearsOfExperience: parsed.yearsOfExperience,
      qualification:     parsed.qualification,
    };
  },
};