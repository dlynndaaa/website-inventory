-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'user')),
    
    -- Admin specific fields
    employee_id VARCHAR(100),
    work_unit VARCHAR(100),
    phone VARCHAR(20),
    
    -- User specific fields
    student_id VARCHAR(100),
    study_program VARCHAR(100),
    faculty VARCHAR(100),
    whatsapp VARCHAR(20),
    
    -- Common fields
    avatar TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    
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

-- Items table
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    available INTEGER NOT NULL DEFAULT 0,
    borrowed INTEGER NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    condition VARCHAR(50) NOT NULL CHECK (condition IN ('good', 'damaged', 'maintenance')),
    description TEXT,
    image_url TEXT,
    
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

-- Borrowings table
CREATE TABLE borrowings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    borrower_id UUID NOT NULL,
    item_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    borrow_date DATE NOT NULL,
    return_date DATE NOT NULL,
    actual_return_date DATE,
    purpose TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'returned', 'overdue')),
    borrowing_letter_url TEXT,
    notes TEXT,
    approved_by UUID,
    approved_date TIMESTAMP,
    
    -- Audit fields
    is_active BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false,
    created_by UUID,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (borrower_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Sessions table for authentication
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    
    -- Audit fields
    is_active BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false,
    created_by UUID,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_is_deleted ON users(is_deleted);

CREATE INDEX idx_items_code ON items(code);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_is_active ON items(is_active);
CREATE INDEX idx_items_is_deleted ON items(is_deleted);

CREATE INDEX idx_borrowings_borrower_id ON borrowings(borrower_id);
CREATE INDEX idx_borrowings_item_id ON borrowings(item_id);
CREATE INDEX idx_borrowings_status ON borrowings(status);
CREATE INDEX idx_borrowings_borrow_date ON borrowings(borrow_date);
CREATE INDEX idx_borrowings_is_active ON borrowings(is_active);
CREATE INDEX idx_borrowings_is_deleted ON borrowings(is_deleted);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Function to automatically update updated_date
CREATE OR REPLACE FUNCTION update_updated_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_date = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_date
CREATE TRIGGER update_users_updated_date BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_date();
CREATE TRIGGER update_items_updated_date BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION update_updated_date();
CREATE TRIGGER update_borrowings_updated_date BEFORE UPDATE ON borrowings FOR EACH ROW EXECUTE FUNCTION update_updated_date();
CREATE TRIGGER update_sessions_updated_date BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_date();
