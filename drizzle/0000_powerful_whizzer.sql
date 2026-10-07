CREATE TABLE `zainab_responses` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`choice` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
