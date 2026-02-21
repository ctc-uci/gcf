CREATE TABLE IF NOT EXISTS media_change (
    id BIGSERIAL PRIMARY KEY,
    update_id BIGINT NOT NULL,
    s3_key VARCHAR(1024) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    is_thumbnail BOOLEAN NOT NULL,
    description TEXT,
    instrument_id BIGINT,
    CONSTRAINT fk_program_update
        FOREIGN KEY(update_id)
            REFERENCES program_update(id)
            ON DELETE CASCADE,
    CONSTRAINT fk_instrument
        FOREIGN KEY(instrument_id)
            REFERENCES instrument(id)
            ON DELETE SET NULL
);