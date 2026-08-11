
export type Subject = {
  id: number;
  name: string;
  code: string;
  description: string;
  department: string;
  createdAt?: string;
};

export type ListResponse<T = unknown> = {
  data?: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CreateResponse<T = unknown> = {
  data?: T;
};

export type GetOneResponse<T = unknown> = {
  data?: T;
};

declare global {
  interface CloudinaryUploadWidgetResults {
    event: string;
    info: {
      secure_url: string;
      public_id: string;
      delete_token?: string;
      resource_type: string;
      original_filename: string;
    };
  }

  interface CloudinaryWidget {
    open: () => void;
  }

  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: Record<string, unknown>,
        callback: (
          error: unknown,
          result: CloudinaryUploadWidgetResults
        ) => void
      ) => CloudinaryWidget;
    };
  }
}

export interface UploadWidgetValue {
  url: string;
  publicId: string;
}

export interface UploadWidgetProps {
  value?: UploadWidgetValue | null;
  onChange?: (value: UploadWidgetValue | null) => void;
  disabled?: boolean;
}

export type UserRole   = "student" | "teacher" | "admin";
export type Status = "active" | "pending" | "suspended";

export type User = {
  id: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  name: string;
  role: UserRole;
  image?: string;
  imageCldPubId?: string;
  department?: string;
  emailVerified:     boolean;

  // Student fields
  institution?:      string | null;
  studentId?:        string | null;

  // Teacher fields
  subject?:          string | null;
  yearsOfExperience?: number | null;
  qualification?:    string | null;
  adminInviteCodeUsed?: string | null;
};

export type Schedule = {
  day: string;
  startTime: string;
  endTime: string;
};

export type Department = {
  id: number;
  name: string;
  description: string;
};

export type ClassDetails = {
  id: number;
  name: string;
  description: string;
  status: "active" | "inactive";
  capacity: number;
  courseCode: string;
  courseName: string;
  bannerUrl?: string;
  bannerCldPubId?: string;
  subject?: Subject;
  teacher?: User;
  department?: Department;
  schedules: Schedule[];
  inviteCode?: string;
};

export type SignUpPayload = {
  email: string;
  name: string;
  password: string;
  image?: string;
  imageCldPubId?: string;
  role: UserRole;
// Student
  institution?:      string;
  studentId?:        string;

  // Teacher
  subject?:          string;
  yearsOfExperience?: number;
  qualification?:    string;

  // Admin
  adminInviteCode?:  string;

};


export interface Permission {
  action:   string;
  resource: string;
}

// ── Admin Invitation types ─────────────────────────────────────────
export type InvitationStatus = "active" | "expired" | "used";

export interface AdminInvitation {
  id:            string;
  createdBy:     string;
  createdByName: string | null;
  expiresAt:     string;
  usedAt:        string | null;
  usedBy:        string | null;
  usedByEmail:   string | null;
  createdAt:     string;
}

export function getInvitationStatus(inv: AdminInvitation): InvitationStatus {
  if (inv.usedAt !== null) return "used";
  if (new Date(inv.expiresAt) <= new Date()) return "expired";
  return "active";
}



