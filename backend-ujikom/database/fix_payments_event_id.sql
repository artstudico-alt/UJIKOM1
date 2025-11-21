-- Fix payments table: Make event_id nullable for account upgrade payments
-- Run this in phpMyAdmin or MySQL Workbench

USE db_ujikom;

-- Drop existing foreign key
ALTER TABLE payments DROP FOREIGN KEY payments_event_id_foreign;

-- Modify event_id to be nullable
ALTER TABLE payments MODIFY event_id BIGINT UNSIGNED NULL;

-- Re-add foreign key constraint
ALTER TABLE payments
ADD CONSTRAINT payments_event_id_foreign
FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- Verify the change
DESCRIBE payments;
