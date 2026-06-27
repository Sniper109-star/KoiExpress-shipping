CREATE TABLE `drivers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`vehicle_type` text NOT NULL,
	`license_plate` text NOT NULL,
	`is_available` integer DEFAULT true NOT NULL,
	`rating` real DEFAULT 5,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `drivers_email_unique` ON `drivers` (`email`);--> statement-breakpoint
CREATE TABLE `packages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tracking_number` text NOT NULL,
	`sender_name` text NOT NULL,
	`sender_email` text NOT NULL,
	`sender_phone` text NOT NULL,
	`sender_address` text NOT NULL,
	`recipient_name` text NOT NULL,
	`recipient_email` text NOT NULL,
	`recipient_phone` text NOT NULL,
	`recipient_address` text NOT NULL,
	`weight` real NOT NULL,
	`dimensions` text,
	`description` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`price` real,
	`user_id` integer,
	`driver_id` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `packages_tracking_number_unique` ON `packages` (`tracking_number`);--> statement-breakpoint
CREATE TABLE `shipments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`package_id` integer NOT NULL,
	`driver_id` integer,
	`pickup_location` text NOT NULL,
	`delivery_location` text NOT NULL,
	`estimated_delivery` integer,
	`actual_delivery` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tracking_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`package_id` integer NOT NULL,
	`status` text NOT NULL,
	`location` text,
	`description` text,
	`timestamp` integer,
	FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`role` text DEFAULT 'customer' NOT NULL,
	`phone` text,
	`address` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);