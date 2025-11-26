CREATE TABLE IF NOT EXISTS program_director (
    user_id BIGSERIAL,
    program_id BIGSERIAL,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (program_id) REFERENCES program(id)
);