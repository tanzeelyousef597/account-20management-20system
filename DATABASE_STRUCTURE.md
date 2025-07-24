# MT Web Experts - Database Structure

## Overview
This document outlines the recommended database structure for the MT Web Experts Accounts Management System, suitable for production deployment with PostgreSQL, MySQL, or any modern relational database.

## Database Tables

### 1. Users Table
Stores all user accounts (Admin & Workers)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Worker')),
    profile_photo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
```

### 2. Work Orders Table
Stores all work orders created by admin or submitted by workers

```sql
CREATE TABLE work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Under QA' 
        CHECK (status IN ('Under QA', 'Approved', 'Rejected', 'In Progress', 'Completed')),
    total_submissions INTEGER NOT NULL DEFAULT 0,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    due_date DATE,
    attachment_url TEXT,
    attachment_name VARCHAR(255),
    business_name VARCHAR(255),
    folder_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_assigned_to ON work_orders(assigned_to);
CREATE INDEX idx_work_orders_created_by ON work_orders(created_by);
CREATE INDEX idx_work_orders_category ON work_orders(category);
CREATE INDEX idx_work_orders_created_at ON work_orders(created_at);
```

### 3. Invoices Table
Stores all generated invoices

```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    submission_count INTEGER DEFAULT 0,
    fixed_pay DECIMAL(10,2) DEFAULT 0.00,
    work_pay DECIMAL(10,2) DEFAULT 0.00,
    fine_amount DECIMAL(10,2) DEFAULT 0.00,
    bonus_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    is_manual BOOLEAN DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one invoice per worker per month
    UNIQUE(worker_id, month, year)
);

-- Indexes
CREATE INDEX idx_invoices_worker_id ON invoices(worker_id);
CREATE INDEX idx_invoices_month_year ON invoices(month, year);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);
```

### 4. Bonuses Table
Stores bonus records for workers

```sql
CREATE TABLE bonuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_bonuses_worker_id ON bonuses(worker_id);
CREATE INDEX idx_bonuses_month_year ON bonuses(month, year);
CREATE INDEX idx_bonuses_created_at ON bonuses(created_at);
```

### 5. Fines Table
Stores fine records for workers

```sql
CREATE TABLE fines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_fines_worker_id ON fines(worker_id);
CREATE INDEX idx_fines_created_at ON fines(created_at);
```

### 6. Activity Logs Table
Stores all system activity for auditing

```sql
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    log_type VARCHAR(50) NOT NULL 
        CHECK (log_type IN ('login', 'logout', 'order_created', 'order_updated', 
                           'user_created', 'invoice_generated', 'bonus_added', 'fine_issued')),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON activity_logs(log_type);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
```

### 7. File Uploads Table
Stores metadata for all uploaded files

```sql
CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    storage_path TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    related_entity_type VARCHAR(50), -- 'work_order', 'profile_photo', etc.
    related_entity_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_file_uploads_uploaded_by ON file_uploads(uploaded_by);
CREATE INDEX idx_file_uploads_entity ON file_uploads(related_entity_type, related_entity_id);
CREATE INDEX idx_file_uploads_created_at ON file_uploads(created_at);
```

### 8. User Sessions Table (Optional - for session management)
Stores active user sessions

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
```

## Views for Analytics

### Dashboard Statistics View
```sql
CREATE VIEW dashboard_stats AS
SELECT 
    COUNT(*) as total_orders,
    SUM(total_submissions) as total_submissions,
    SUM(CASE WHEN status = 'Approved' THEN total_submissions ELSE 0 END) as approved_submissions,
    SUM(CASE WHEN status = 'Rejected' THEN total_submissions ELSE 0 END) as rejected_submissions,
    COUNT(CASE WHEN status = 'Under QA' THEN 1 END) as orders_in_qa,
    COUNT(CASE WHEN assigned_to IS NOT NULL AND status != 'Completed' THEN 1 END) as orders_in_work
FROM work_orders
WHERE created_at >= date_trunc('month', CURRENT_DATE);
```

### Worker Performance View
```sql
CREATE VIEW worker_performance AS
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(wo.id) as total_orders,
    SUM(wo.total_submissions) as total_submissions,
    SUM(CASE WHEN wo.status = 'Approved' THEN wo.total_submissions ELSE 0 END) as approved_submissions,
    COALESCE(SUM(b.amount), 0) as total_bonuses,
    COALESCE(SUM(f.amount), 0) as total_fines
FROM users u
LEFT JOIN work_orders wo ON u.id = wo.created_by OR u.id = wo.assigned_to
LEFT JOIN bonuses b ON u.id = b.worker_id
LEFT JOIN fines f ON u.id = f.worker_id
WHERE u.role = 'Worker'
GROUP BY u.id, u.name, u.email;
```

## Security Considerations

### 1. Password Security
- Always hash passwords using bcrypt or Argon2
- Never store plain text passwords
- Implement password strength requirements

### 2. Data Validation
- Use database constraints for data integrity
- Implement input validation in application layer
- Use parameterized queries to prevent SQL injection

### 3. Access Control
- Implement role-based access control (RBAC)
- Use database-level permissions
- Log all sensitive operations

## Migration Strategy

### For Development
1. Use PostgreSQL or MySQL
2. Set up database connection pooling
3. Implement proper backup strategy

### For Production
1. Use managed database service (AWS RDS, Google Cloud SQL, etc.)
2. Enable automatic backups
3. Set up read replicas for scaling
4. Implement monitoring and alerting

## Environment Variables
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mt_web_experts
DB_USER=your_username
DB_PASSWORD=your_secure_password
DB_SSL=require

# File Storage
FILE_STORAGE_BUCKET=your-s3-bucket
FILE_STORAGE_REGION=us-east-1

# Security
JWT_SECRET=your-jwt-secret
BCRYPT_ROUNDS=12
```

## Recommended Technology Stack

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Prisma** or **TypeORM** for database ORM
- **bcrypt** for password hashing
- **jsonwebtoken** for authentication

### Database
- **PostgreSQL** (recommended) or **MySQL**
- **Redis** for session storage and caching

### File Storage
- **AWS S3** or **Google Cloud Storage** for file uploads
- **Cloudinary** for image processing

### Deployment
- **Docker** containers
- **AWS ECS**, **Google Cloud Run**, or **DigitalOcean App Platform**
- **CloudFlare** for CDN and security

This structure provides scalability, security, and maintainability for the MT Web Experts system.
