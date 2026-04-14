CREATE TABLE public.gcf_user (
  id text PRIMARY KEY DEFAULT nextval('gcf_user_id_seq'::regclass),
  role roles NOT NULL,
  first_name character varying(70) NOT NULL,
  last_name character varying(70) NOT NULL,
  created_by text NULL,
  picture text NULL,
  preferred_language character varying(10) NOT NULL DEFAULT 'en'::character varying
);

ALTER TABLE public.gcf_user
ADD CONSTRAINT fk_created_by
        FOREIGN KEY (created_by) REFERENCES user(id)
        ON DELETE SET NULL;