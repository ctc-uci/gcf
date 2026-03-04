CREATE TYPE status_type AS ENUM ('Active', 'Inactive');

CREATE TABLE program (
    id BIGSERIAL PRIMARY KEY,
    created_by BIGINT NOT NULL,
    name VARCHAR(70) NOT NULL,
    date_created TIMESTAMP NOT NULL,
    region_id INTEGER NOT NULL,
    country_id INTEGER NOT NULL,
    state_id INTEGER,
    city VARCHAR(140),
    title VARCHAR(140) NOT NULL,
    description VARCHAR,
    primary_language VARCHAR,
    partner_org BIGINT NOT NULL,
    status status_type NOT NULL,
    launch_date DATE NOT NULL,
    CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES user(id),
    CONSTRAINT fk_region FOREIGN KEY (region_id) REFERENCES region(id),
    CONSTRAINT fk_partner_org FOREIGN KEY (partner_org) REFERENCES partner_organization(id),
);