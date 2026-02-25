CREATE TYPE ROLES AS ENUM ('Regional Director', 'Program Director', 'Admin');

CREATE TABLE IF NOT EXISTS user (
    id BIGSERIAL PRIMARY KEY,
    role ROLES NOT NULL,
    email VARCHAR(100) NOT NULL, 
    first_name VARCHAR(70) NOT NULL,
    last_name VARCHAR(70) NOT NULL,
    date_created DATE NOT NULL,
    created_by BIGINT,
    picture TEXT,
    CONSTRAINT fk_created_by
        FOREIGN KEY (created_by) REFERENCES user(id)
        ON DELETE SET NULL
);