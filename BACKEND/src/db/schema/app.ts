import { desc } from 'drizzle-orm';
import { pgTable, integer, varchar, timestamp } from 'drizzle-orm/pg-core';


const timestamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
};

export const departments = pgTable('departments', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  code: varchar('code', { length: 55 }).notNull().unique(),
  name: varchar('name', {length:255}).notNull(),
  description: varchar('description', {length:255}),
    ...timestamps,  //destructuring the timestamps object to include createdAt and updatedAt fields in the users table
});


export const subjects = pgTable('subjects', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  departmentId: integer('department_id').notNull().references(() => departments.id, { onDelete: 'cascade' }),
  name: varchar('name', {length:255}).notNull(),
  code: varchar('code', { length: 55 }).notNull().unique(),
  description: varchar('description', {length:255}),
    ...timestamps,  //destructuring the timestamps object to include createdAt and updatedAt fields in the users table
});


//Creating relations between the tables


