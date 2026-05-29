CREATE TABLE public.region (
    id integer NOT NULL,
    name character varying(70) NOT NULL,
    last_modified timestamp with time zone NOT NULL,
    CONSTRAINT region_pkey PRIMARY KEY (id)
);

CREATE SEQUENCE public.region_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.region_id_seq OWNED BY public.region.id;

ALTER TABLE ONLY public.region ALTER COLUMN id SET DEFAULT nextval('public.region_id_seq'::regclass);
