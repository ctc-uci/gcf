CREATE TABLE IF NOT EXISTS enrollment_change (
    id BIGSERIAL PRIMARY KEY,
    update_id BIGINT NOT NULL,
    enrollment_change SMALLINT NOT NULL,
    graduated_change SMALLINT NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('new_joined', 'graduated', 'quit', 'other')),
    description TEXT,

    CONSTRAINT fk_program_update
        FOREIGN KEY (update_id)
            REFERENCES program_update(id)
            ON DELETE CASCADE
);