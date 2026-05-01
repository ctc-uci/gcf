CREATE TABLE public.media_change (
  id bigserial NOT NULL PRIMARY KEY,
  update_id bigint NOT NULL,
  s3_key character varying(1024) NOT NULL,
  file_name character varying(255) NOT NULL,
  file_type character varying(50) NOT NULL,
  is_thumbnail boolean NOT NULL,
  description text NULL,
  status character varying(255) NULL DEFAULT 'unread'::character varying,
  instrument_id bigint NULL
);

ALTER TABLE public.media_change
ADD CONSTRAINT fk_program_update
    FOREIGN KEY(update_id)
        REFERENCES program_update(id)
        ON DELETE CASCADE;