CREATE TABLE public.enrollment_change (
    id bigint NOT NULL,
    update_id bigint NOT NULL,
    enrollment_change smallint NOT NULL,
    graduated_change smallint NOT NULL,
    event_type character varying(50) NOT NULL,
    description text,
    CONSTRAINT enrollment_change_event_type_check CHECK ((event_type::text = ANY (ARRAY['new_joined'::character varying, 'graduated'::character varying, 'quit'::character varying, 'other'::character varying]::text[]))),
    CONSTRAINT enrollment_change_pkey PRIMARY KEY (id),
    CONSTRAINT fk_program_update FOREIGN KEY (update_id) REFERENCES public.program_update(id) ON DELETE CASCADE
);

CREATE SEQUENCE public.enrollment_change_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.enrollment_change_id_seq OWNED BY public.enrollment_change.id;

ALTER TABLE ONLY public.enrollment_change ALTER COLUMN id SET DEFAULT nextval('public.enrollment_change_id_seq'::regclass);
