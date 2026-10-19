CREATE TABLE IF NOT EXISTS audit_logs (
    review_id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    task_summary TEXT NOT NULL,
    sensitivity_reason TEXT,
    status TEXT CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewer_comment TEXT
);

CREATE INDEX IF NOT EXISTS idx_pending_reviews ON audit_logs(status) WHERE status = 'PENDING';
