CREATE TABLE IF NOT EXISTS enrollment_change (
    id BIGSERIAL PRIMARY KEY,
    update_id BIGSERIAL,
    enrollment_change SMALLINT NOT NULL,
    graduated_change SMALLINT NOT NULL,

    CONSTRAINT fk_program_update
        FOREIGN KEY (update_id)
            REFERENCES program_update(id)
);