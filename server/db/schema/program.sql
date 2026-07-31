CREATE TYPE public.status_type AS ENUM (
    'Active',
    'Inactive'
);

CREATE TABLE public.program (
    id bigint NOT NULL,
    created_by text NOT NULL,
    name character varying(70) NOT NULL,
    date_created timestamp with time zone NOT NULL,
    country integer NOT NULL,
    title character varying(140) NOT NULL,
    description character varying,
    primary_language character varying,
    partner_org bigint NOT NULL,
    status public.status_type NOT NULL,
    launch_date date NOT NULL,
    state integer,
    city integer,
    languages character varying(2)[],
    CONSTRAINT program_pkey PRIMARY KEY (id),
    CONSTRAINT fk_country1 FOREIGN KEY (country) REFERENCES public.country(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_created_by1 FOREIGN KEY (created_by) REFERENCES public.gcf_user(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_partner_org FOREIGN KEY (partner_org) REFERENCES public.partner_organization(id) ON DELETE SET NULL
);

CREATE SEQUENCE public.program_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.program_id_seq OWNED BY public.program.id;

ALTER TABLE ONLY public.program ALTER COLUMN id SET DEFAULT nextval('public.program_id_seq'::regclass);
