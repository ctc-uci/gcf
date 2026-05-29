CREATE TABLE public.partner_organization (
    id bigint NOT NULL,
    name character varying(256) NOT NULL,
    CONSTRAINT partner_organization_pkey PRIMARY KEY (id)
);

CREATE SEQUENCE public.partner_organization_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.partner_organization_id_seq OWNED BY public.partner_organization.id;

ALTER TABLE ONLY public.partner_organization ALTER COLUMN id SET DEFAULT nextval('public.partner_organization_id_seq'::regclass);
