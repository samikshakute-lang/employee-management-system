CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL UNIQUE,
	`password_hash` text NOT NULL,
	`role` text NOT NULL DEFAULT 'Employee',
	`created_at` integer NOT NULL DEFAULT (unixepoch()),
	CONSTRAINT `users_role_check` CHECK (`role` IN ('Admin', 'HR', 'Employee'))
);
