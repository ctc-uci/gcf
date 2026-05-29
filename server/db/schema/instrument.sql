CREATE TABLE public.instrument (
    id bigint NOT NULL,
    name character varying(70) NOT NULL,
    CONSTRAINT instrument_pkey PRIMARY KEY (id)
);

CREATE SEQUENCE public.instrument_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.instrument_id_seq OWNED BY public.instrument.id;

ALTER TABLE ONLY public.instrument ALTER COLUMN id SET DEFAULT nextval('public.instrument_id_seq'::regclass);
