CREATE TABLE playlist (
    program_id BIGINT NOT NULL,
    link TEXT NOT NULL,
    name VARCHAR(256) NOT NULL,
    CONSTRAINT fk_program_id 
        FOREIGN KEY (program_id) 
        REFERENCES program(id),
    PRIMARY KEY (program_id, link)
);

