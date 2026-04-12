CREATE TABLE public.account_change (
  id bigserial NOT NULL,
  user_id text NOT NULL,
  author_id text NOT NULL,
  change_type character varying(50) NOT NULL,
  old_values jsonb NULL,
  new_values jsonb NULL,
  resolved boolean NOT NULL DEFAULT false,
  last_modified timestamp without time zone NOT NULL
);

ALTER TABLE public.account_change
ADD CONSTRAINT account_change_pkey PRIMARY KEY (id)