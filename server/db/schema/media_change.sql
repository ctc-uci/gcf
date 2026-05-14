CREATE TABLE public.media_change (
    id bigint NOT NULL,
    update_id bigint NOT NULL,
    s3_key character varying(1024) NOT NULL,
    file_name character varying(255) NOT NULL,
    file_type character varying(50) NOT NULL,
    is_thumbnail boolean NOT NULL,
    description text,
    status character varying(255) DEFAULT 'unread'::character varying,
    instrument_id bigint,
    CONSTRAINT media_change_pkey PRIMARY KEY (id),
    CONSTRAINT fk_program_update FOREIGN KEY (update_id) REFERENCES public.program_update(id) ON DELETE CASCADE,
    CONSTRAINT fk_instrument FOREIGN KEY (instrument_id) REFERENCES public.instrument(id)
);

CREATE SEQUENCE public.media_change_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.media_change_id_seq OWNED BY public.media_change.id;

ALTER TABLE ONLY public.media_change ALTER COLUMN id SET DEFAULT nextval('public.media_change_id_seq'::regclass);
