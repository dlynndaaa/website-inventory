-- Update borrowings table to use file_ids instead of borrowing_letter_url
ALTER TABLE borrowings 
DROP COLUMN IF EXISTS borrowing_letter_url;

ALTER TABLE borrowings 
ADD COLUMN IF NOT EXISTS borrowing_letter_file_ids TEXT DEFAULT '';

-- Add comment for clarity
COMMENT ON COLUMN borrowings.borrowing_letter_file_ids IS 'Comma-separated file IDs from files table';
