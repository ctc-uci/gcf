CREATE TABLE IF NOT EXISTS media_change (
    id BIGSERIAL PRIMARY KEY,
    update_id BIGSERIAL,
    s3_key VARCHAR(1024) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    is_thumbnail BOOLEAN NOT NULL,
    CONSTRAINT fk_program_update
        FOREIGN KEY(update_id)
            REFERENCES program_update(id)
);