CREATE TABLE public.enrollment_change (
  id bigserial PRIMARY KEY,
  update_id bigint NOT NULL,
  enrollment_change smallint NOT NULL,
  graduated_change smallint NOT NULL,
  event_type character varying(50) NOT NULL,
  description text NULL
);

ALTER TABLE public.enrollment_change
ADD CONSTRAINT fk_program_update
    FOREIGN KEY(update_id)
        REFERENCES program_update(id)
        ON DELETE CASCADE;