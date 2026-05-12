CREATE TABLE public.country (
  id serial PRIMARY KEY,
  region_id integer NOT NULL,
  name character varying(70) NOT NULL,
  last_modified TIMESTAMPTZ NOT NULL,
  iso_code character varying(3) NULL
);

ALTER TABLE public.country
ADD CONSTRAINT fk_region_id
    FOREIGN KEY(region_id)
        REFERENCES region(id)
        ON DELETE CASCADE,
		ON UPDATE CASCADE;