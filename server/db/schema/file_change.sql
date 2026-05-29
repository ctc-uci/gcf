CREATE TABLE public.file_change (
    id bigint NOT NULL,
    update_id bigint NOT NULL,
    s3_key character varying(1024) NOT NULL,
    file_name character varying(255) NOT NULL,
    file_type character varying(50) NOT NULL,
    description text,
    status text DEFAULT 'Unread'::text,
    CONSTRAINT file_change_pkey PRIMARY KEY (id),
    CONSTRAINT fk_program_update FOREIGN KEY (update_id) REFERENCES public.program_update(id) ON DELETE CASCADE
);

CREATE SEQUENCE public.file_change_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.file_change_id_seq OWNED BY public.file_change.id;

ALTER TABLE ONLY public.file_change ALTER COLUMN id SET DEFAULT nextval('public.file_change_id_seq'::regclass);
