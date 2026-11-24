import { randomUUID } from 'node:crypto';
import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * The only roles the system recognises, as named in the README.
 * Single source of truth for the role type and for every zod enum built on it.
 */
export const ROLES = ['Admin', 'HR', 'Employee'] as const;

export type Role = (typeof ROLES)[number];

export const users = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: [...ROLES] })
    .notNull()
    .default('Employee'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

/** User shape that is safe to return from the API: never contains the password hash. */
export type PublicUser = {
  id: string;
  email: string;
  role: Role;
  createdAt: Date;
};
