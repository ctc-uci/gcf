CREATE TABLE program_update (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(256) NOT NULL,
    program_id BIGINT REFERENCES program(id) NOT NULL,
    created_by BIGINT REFERENCES "user"(id) NOT NULL,
    date DATE NOT NULL,
    note TEXT NOT NULL
);