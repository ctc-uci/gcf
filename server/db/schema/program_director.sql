CREATE TABLE IF NOT EXISTS program_director (
    user_id BIGINT,
    program_id BIGINT,
    CONSTRAINT fk_user_id
        FOREIGN KEY (user_id) 
        REFERENCES user(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_program_id
        FOREIGN KEY (program_id) 
        REFERENCES program(id)
        ON DELETE CASCADE,
    PRIMARY KEY (user_id, program_id)
);