CREATE TABLE public.instrument_change_photo (
  id bigserial NOT NULL PRIMARY KEY,
  instrument_change_id bigint NOT NULL,
  s3_key character varying(1024) NOT NULL,
  file_name character varying(255) NOT NULL,
  file_type character varying(50) NOT NULL,
  description text NULL
);

ALTER TABLE public.instrument_change_photo
ADD CONSTRAINT fk_instrument_change
    FOREIGN KEY(instrument_change_id)
        REFERENCES instrument_change(id)
        ON DELETE CASCADE;