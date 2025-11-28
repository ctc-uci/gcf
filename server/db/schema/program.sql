CREATE TYPE status_type AS ENUM ('Active', 'Inactive');

CREATE TABLE dummy_user (
    id BIGSERIAL PRIMARY KEY UNIQUE NOT NULL
);

CREATE TABLE dummy_country (
    id SERIAL PRIMARY KEY UNIQUE NOT NULL
);

CREATE TABLE dummy_partner_organization (
    id BIGSERIAL PRIMARY KEY NOT NULL
);

CREATE TABLE program (
    id BIGSERIAL PRIMARY KEY UNIQUE NOT NULL,
    created_by BIGSERIAL NOT NULL REFERENCES dummy_user(id),
    name VARCHAR(70) NOT NULL,
    date_created TIMESTAMP NOT NULL,
    country SERIAL NOT NULL REFERENCES dummy_country(id),
    title VARCHAR(140) NOT NULL,
    description VARCHAR,
    primary_language VARCHAR,
    playlist_link VARCHAR,
    partner_org BIGSERIAL REFERENCES dummy_partner_organization(id) NOT NULL,
    status status_type NOT NULL,
    launch_date DATE NOT NULL
);