CREATE TABLE public.instrument_change_photo (
    id bigint NOT NULL,
    instrument_change_id bigint NOT NULL,
    s3_key character varying(1024) NOT NULL,
    file_name character varying(255) NOT NULL,
    file_type character varying(50) NOT NULL,
    description text,
    CONSTRAINT instrument_change_photo_pkey PRIMARY KEY (id),
    CONSTRAINT fk_instrument_change FOREIGN KEY (instrument_change_id) REFERENCES public.instrument_change(id) ON DELETE CASCADE
);

CREATE SEQUENCE public.instrument_change_photo_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.instrument_change_photo_id_seq OWNED BY public.instrument_change_photo.id;

ALTER TABLE ONLY public.instrument_change_photo ALTER COLUMN id SET DEFAULT nextval('public.instrument_change_photo_id_seq'::regclass);
