CREATE TABLE public.country (
    id integer NOT NULL,
    region_id integer NOT NULL,
    name character varying(70) NOT NULL,
    last_modified timestamp with time zone NOT NULL,
    iso_code character varying(3),
    CONSTRAINT country_pkey PRIMARY KEY (id),
    CONSTRAINT country_iso_code_unique UNIQUE (iso_code),
    CONSTRAINT fk_region_id FOREIGN KEY (region_id) REFERENCES public.region(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE SEQUENCE public.country_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.country_id_seq OWNED BY public.country.id;

ALTER TABLE ONLY public.country ALTER COLUMN id SET DEFAULT nextval('public.country_id_seq'::regclass);
