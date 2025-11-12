-- Table: public.users

-- DROP TABLE IF EXISTS public.users;

CREATE TABLE IF NOT EXISTS public.users
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    email character varying(256) COLLATE pg_catalog."default" NOT NULL,
    firebase_uid character varying(128) COLLATE pg_catalog."default" NOT NULL,
    role character varying(16) COLLATE pg_catalog."default" NOT NULL DEFAULT 'user'::character varying,
    CONSTRAINT user_pkey PRIMARY KEY (id),
    CONSTRAINT email UNIQUE (email),
    CONSTRAINT firebase_uid UNIQUE (firebase_uid),
    CONSTRAINT role_check CHECK (role::text = ANY (ARRAY['user'::character varying, 'admin'::character varying]::text[]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;
