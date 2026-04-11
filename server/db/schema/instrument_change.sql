CREATE TABLE public.instrument_change (
  id bigserial NOT NULL,
  instrument_id bigint NOT NULL,
  update_id bigint NOT NULL,
  amount_changed smallint NOT NULL,
  special_request boolean NOT NULL DEFAULT false,
  event_type character varying(50) NOT NULL,
  description text NULL
);

ALTER TABLE public.instrument_change
ADD CONSTRAINT instrument_change_pkey PRIMARY KEY (id)