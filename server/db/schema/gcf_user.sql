CREATE TYPE public.roles AS ENUM (
    'Regional Director',
    'Program Director',
    'Admin',
    'Super Admin'
);

CREATE TABLE public.gcf_user (
    id text NOT NULL,
    role public.roles NOT NULL,
    first_name character varying(70) NOT NULL,
    last_name character varying(70) NOT NULL,
    created_by text,
    picture text,
    preferred_language character varying(10) NOT NULL DEFAULT 'en'::character varying,
    CONSTRAINT gcf_user_pkey PRIMARY KEY (id),
    CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES public.gcf_user(id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE SEQUENCE public.gcf_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.gcf_user_id_seq OWNED BY public.gcf_user.id;

ALTER TABLE ONLY public.gcf_user ALTER COLUMN id SET DEFAULT nextval('public.gcf_user_id_seq'::regclass);
