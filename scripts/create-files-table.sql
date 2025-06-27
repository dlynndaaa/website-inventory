-- Create files table for storing file metadata
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL UNIQUE,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    folder VARCHAR(100) NOT NULL DEFAULT 'general',
    
    -- File status and type
    file_type VARCHAR(50) NOT NULL, -- 'image', 'document', 'other'
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
    
    -- Usage tracking
    reference_table VARCHAR(100), -- 'items', 'borrowings', etc.
    reference_id UUID,
    
    -- Audit fields
    is_active BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false,
    created_by UUID,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_files_file_name ON files(file_name);
CREATE INDEX idx_files_reference ON files(reference_table, reference_id);
CREATE INDEX idx_files_folder ON files(folder);
CREATE INDEX idx_files_status ON files(status);
CREATE INDEX idx_files_is_active ON files(is_active);
CREATE INDEX idx_files_is_deleted ON files(is_deleted);

-- Add trigger for updated_date
CREATE TRIGGER update_files_updated_date 
    BEFORE UPDATE ON files 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_date();

-- Update items table to use file_ids instead of image_url
ALTER TABLE items DROP COLUMN IF EXISTS image_url;
ALTER TABLE items ADD COLUMN file_ids TEXT; -- Comma-separated file IDs
