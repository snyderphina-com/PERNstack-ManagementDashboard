import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth.js";

const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export const classStatusEnum = pgEnum("class_status", [
  "active",
  "inactive",
  "archived",
]);

export const departments = pgTable("departments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),

  ...timestamps,
});

export const subjects = pgTable("subjects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  departmentId: integer("department_id")
    .notNull()
    .references(() => departments.id, { onDelete: "restrict" }),

  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),

  ...timestamps,
});

export const classes = pgTable(
  "classes",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

    subjectId: integer("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    teacherId: text("teacher_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),

    inviteCode: varchar("invite_code", { length: 50 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    bannerCldPubId: text("banner_cld_pub_id"),
    bannerUrl: text("banner_url"),
    capacity: integer("capacity").notNull().default(50),
    description: text("description"),
    status: classStatusEnum("status").notNull().default("active"),
    schedules: jsonb("schedules").$type<Schedule[]>().notNull(),

    ...timestamps,
  },
  (table) => ({
    subjectIdIdx: index("classes_subject_id_idx").on(table.subjectId),
    teacherIdIdx: index("classes_teacher_id_idx").on(table.teacherId),
  })
);

export const enrollments = pgTable(
  "enrollments",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

    studentId: text("student_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    classId: integer("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),

    ...timestamps,
  },
  (table) => ({
    studentIdIdx: index("enrollments_student_id_idx").on(table.studentId),
    classIdIdx: index("enrollments_class_id_idx").on(table.classId),
    studentClassUnique: index("enrollments_student_class_unique").on(
      table.studentId,
      table.classId
    ),
  })
);

export const departmentsRelations = relations(departments, ({ many }) => ({
  subjects: many(subjects),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  department: one(departments, {
    fields: [subjects.departmentId],
    references: [departments.id],
  }),
  classes: many(classes),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [classes.subjectId],
    references: [subjects.id],
  }),
  teacher: one(user, {
    fields: [classes.teacherId],
    references: [user.id],
  }),
  enrollments: many(enrollments),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(user, {
    fields: [enrollments.studentId],
    references: [user.id],
  }),
  class: one(classes, {
    fields: [enrollments.classId],
    references: [classes.id],
  }),
}));



 /* adminNotifications
 *
 * Lightweight in-app notification store.
 * Created server-side when events that admins need to act on occur
 * (e.g. a new pending admin account).
 *
 * Admins poll GET /api/notifications to display these.
 */
export const adminNotifications = pgTable("admin_notifications", {
  id:          text("id").primaryKey(),
  type:        text("type").notNull(),          // e.g. "admin_approval_request"
  title:       text("title").notNull(),
  message:     text("message").notNull(),
  targetRole:  text("target_role").notNull(),   // which role should see this
  referenceId: text("reference_id"),            // user id of the requester
  read:        boolean("read").notNull().default(false),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
});

/*
 * Stores hashed admin invitation codes.
 * The plaintext code is NEVER persisted — only returned once at creation.
 *
 * Security model:
 *   - SHA-256 hash of the plaintext code stored in codeHash
 *   - Each code is single-use (usedAt becomes non-null after consumption)
 *   - Each code has a hard expiry (expiresAt)
 *   - createdBy references the admin who generated it
 *   - usedBy references the user who consumed it (set at registration)
 */
export const adminInvitations = pgTable(
  "admin_invitations",
  {
    id:        text("id").primaryKey(),
    codeHash:  text("code_hash").notNull(),
    createdBy: text("created_by").notNull(), // admin user id
    expiresAt: timestamp("expires_at").notNull(),
    usedAt:    timestamp("used_at"),          // null = not yet used
    usedBy:    text("used_by"),               // null until consumed
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    codeHashUnique: uniqueIndex("admin_invitations_code_hash_unique").on(
      table.codeHash
    ),
    createdByIdx: index("admin_invitations_created_by_idx").on(
      table.createdBy
    ),
  })
);

export type AdminInvitation    = typeof adminInvitations.$inferSelect;
export type NewAdminInvitation = typeof adminInvitations.$inferInsert;


export type AdminNotification    = typeof adminNotifications.$inferSelect;
export type NewAdminNotification = typeof adminNotifications.$inferInsert;

export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;

export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;

export type Class = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;

export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;
