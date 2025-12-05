CREATE TYPE status_type AS ENUM ('Active', 'Inactive');

CREATE TABLE program (
    id BIGSERIAL PRIMARY KEY,
    created_by BIGINT NOT NULL,
    name VARCHAR(70) NOT NULL,
    date_created TIMESTAMP NOT NULL,
    country INTEGER NOT NULL,
    title VARCHAR(140) NOT NULL,
    description VARCHAR,
    primary_language VARCHAR,
    playlist_link VARCHAR,
    partner_org BIGINT NOT NULL,
    status status_type NOT NULL,
    launch_date DATE NOT NULL,
    CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES user(id),
    CONSTRAINT fk_country FOREIGN KEY (country) REFERENCES country(id),
    CONSTRAINT fk_partner_org FOREIGN KEY (partner_org) REFERENCES partner_organization(id),
);