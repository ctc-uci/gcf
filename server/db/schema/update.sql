CREATE TABLE update (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(256),
    program_id BIGINT REFERENCES program(id),
    created_by BIGINT REFERENCES "user"(id),
    date DATE,
    note VARCHAR NULL
);